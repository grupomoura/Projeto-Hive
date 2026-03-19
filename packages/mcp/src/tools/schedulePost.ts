import { api } from '../api-client';
import { SchedulePostInput } from '../types';

export async function schedulePost(input: SchedulePostInput) {
  const result = (await api.schedulePost(input.post_id, input.datetime)) as any;
  return { scheduled_at: result.scheduledAt, status: result.status };
}
