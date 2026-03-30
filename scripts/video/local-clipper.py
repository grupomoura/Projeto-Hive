#!/usr/bin/env python3
"""
OpenHive Local Video Clipper
Runs on user's local machine. Processes videos and uploads clips to VPS.

Usage:
    python local-clipper.py --url "https://youtube.com/watch?v=xxx" --server "https://your-openhive.com" --token "your-jwt-token"
    python local-clipper.py --file "./video.mp4" --server "https://your-openhive.com" --token "your-jwt-token"
    python local-clipper.py --url "URL" --server "URL" --token "TOKEN" --auto
"""

import argparse
import json
import os
import sys
import tempfile
import urllib.request
import urllib.error

# Import from sibling scripts
from analyze import download_video, transcribe_video, find_best_moments, format_time
from clipper import process_clip, detect_face_region


def upload_clip_to_server(server_url: str, token: str, clip_data: dict, video_file: str, srt_file: str = None, ass_file: str = None):
    """Upload a processed clip to the OpenHive server."""
    import mimetypes

    boundary = '----OpenHiveUploadBoundary'
    body = b''

    # Add JSON metadata
    body += f'--{boundary}\r\n'.encode()
    body += b'Content-Disposition: form-data; name="metadata"\r\n'
    body += b'Content-Type: application/json\r\n\r\n'
    body += json.dumps(clip_data).encode()
    body += b'\r\n'

    # Add video file
    if os.path.exists(video_file):
        body += f'--{boundary}\r\n'.encode()
        body += f'Content-Disposition: form-data; name="video"; filename="{os.path.basename(video_file)}"\r\n'.encode()
        body += b'Content-Type: video/mp4\r\n\r\n'
        with open(video_file, 'rb') as f:
            body += f.read()
        body += b'\r\n'

    # Add SRT
    if srt_file and os.path.exists(srt_file):
        body += f'--{boundary}\r\n'.encode()
        body += f'Content-Disposition: form-data; name="srt"; filename="{os.path.basename(srt_file)}"\r\n'.encode()
        body += b'Content-Type: text/plain\r\n\r\n'
        with open(srt_file, 'rb') as f:
            body += f.read()
        body += b'\r\n'

    # Add ASS
    if ass_file and os.path.exists(ass_file):
        body += f'--{boundary}\r\n'.encode()
        body += f'Content-Disposition: form-data; name="ass"; filename="{os.path.basename(ass_file)}"\r\n'.encode()
        body += b'Content-Type: text/plain\r\n\r\n'
        with open(ass_file, 'rb') as f:
            body += f.read()
        body += b'\r\n'

    body += f'--{boundary}--\r\n'.encode()

    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': f'multipart/form-data; boundary={boundary}',
    }

    url = f'{server_url.rstrip("/")}/api/videos/sync'
    req = urllib.request.Request(url, data=body, headers=headers, method='POST')

    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        error_body = e.read().decode() if e.fp else str(e)
        raise RuntimeError(f'Upload failed ({e.code}): {error_body}')


def main():
    parser = argparse.ArgumentParser(description='OpenHive Local Video Clipper')
    parser.add_argument('--url', help='YouTube video URL')
    parser.add_argument('--file', help='Local video file path')
    parser.add_argument('--server', required=True, help='OpenHive server URL (e.g. https://your-openhive.com)')
    parser.add_argument('--token', required=True, help='JWT token (get from browser localStorage)')
    parser.add_argument('--auto', action='store_true', help='Auto-detect and cut best moments')
    parser.add_argument('--max-clips', type=int, default=5, help='Max clips in auto mode')
    parser.add_argument('--whisper-model', default='tiny', choices=['tiny', 'base', 'small', 'medium', 'large'])
    parser.add_argument('--format', default='vertical', choices=['vertical', 'square', 'horizontal'])
    parser.add_argument('--language', default=None)
    args = parser.parse_args()

    if not args.url and not args.file:
        print('Error: provide --url or --file')
        sys.exit(1)

    work_dir = tempfile.mkdtemp(prefix='openhive-clips-')
    print(f'Working directory: {work_dir}')

    try:
        # Step 1: Get video
        if args.file:
            import shutil
            video_path = os.path.join(work_dir, 'video.mp4')
            shutil.copy2(args.file, video_path)
            video_info = {
                'title': os.path.basename(args.file),
                'channel': 'Local',
                'duration': 0,
                'views': 0,
                'url': f'file://{args.file}',
                'video_path': video_path,
            }
            print(f'Using local file: {args.file}')
        else:
            print(f'Downloading: {args.url}')
            video_info = download_video(args.url, work_dir)
            print(f'Video: {video_info["title"]} ({video_info["duration"]}s)')

        video_path = video_info.get('video_path', os.path.join(work_dir, 'video.mp4'))

        # Step 2: Transcribe
        print('Transcribing...')
        transcription = transcribe_video(video_path, model_name=args.whisper_model, language=args.language)
        detected_language = transcription.get('language', 'unknown')
        print(f'Language: {detected_language}')

        # Step 3: Find moments
        moments = find_best_moments(transcription, max_moments=args.max_clips)
        print(f'\n{len(moments)} best moments found:\n')

        for m in moments:
            print(f"  #{m['rank']} [{m['start_formatted']} - {m['end_formatted']}] Score: {m['score']} | {m['duration']}s")
            print(f"    {m['hook'][:80]}")
            print()

        if not args.auto:
            # Ask user which clips to cut
            selection = input('Which clips? (e.g. "1,2,3" or "all"): ').strip()
            if selection.lower() == 'all':
                selected = moments
            else:
                indices = [int(x.strip()) - 1 for x in selection.split(',')]
                selected = [moments[i] for i in indices if 0 <= i < len(moments)]
        else:
            selected = moments

        if not selected:
            print('No clips selected.')
            return

        # Step 4: Detect face
        print('\nDetecting face...')
        face_info = detect_face_region(video_path)
        if face_info.get('detected'):
            print(f"  Face detected (confidence: {face_info['confidence']:.0%})")
        else:
            print(f"  No face detected, using center crop")

        # Step 5: Process clips
        clips_dir = os.path.join(work_dir, 'clips')
        os.makedirs(clips_dir, exist_ok=True)

        results = []
        for idx, moment in enumerate(selected, 1):
            print(f'\nProcessing clip {idx}/{len(selected)}: {moment.get("hook", "")[:50]}...')
            clip_info = {
                'start': moment['start'],
                'end': moment['end'],
                'title': moment.get('hook', f'clip-{idx}')[:50],
            }
            result = process_clip(
                video_path=video_path,
                clip_info=clip_info,
                clip_index=idx,
                output_dir=clips_dir,
                fmt=args.format,
                face_info=face_info,
                whisper_model=args.whisper_model,
                language=args.language,
            )
            results.append(result)

        # Step 6: Upload to server
        print(f'\n\nUploading {len(results)} clip(s) to {args.server}...')

        sync_data = {
            'title': video_info.get('title', 'Local clip'),
            'sourceUrl': video_info.get('url', 'local://'),
            'language': detected_language,
            'duration': video_info.get('duration', 0),
            'moments': moments,
            'clips': [],
        }

        for r in results:
            clip_entry = {
                'index': r['index'],
                'title': r['title'],
                'start': r['start'],
                'end': r['end'],
                'duration': r['duration'],
            }

            print(f'  Uploading clip {r["index"]}: {r["title"][:40]}...')
            upload_result = upload_clip_to_server(
                server_url=args.server,
                token=args.token,
                clip_data=clip_entry,
                video_file=r.get('video', ''),
                srt_file=r.get('srt', ''),
                ass_file=r.get('ass', ''),
            )
            print(f'    Uploaded! {upload_result}')
            sync_data['clips'].append(clip_entry)

        print(f'\n\nDone! {len(results)} clips processed and uploaded.')
        print(f'Check your clips at {args.server}/clips')

    except Exception as e:
        print(f'\nError: {e}', file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
