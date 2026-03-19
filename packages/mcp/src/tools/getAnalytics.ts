import { api } from '../api-client';
import { GetAnalyticsInput } from '../types';

export async function getAnalytics(input: GetAnalyticsInput) {
  const result = (await api.getAnalytics(input.period || '30d')) as any;
  return result;
}
