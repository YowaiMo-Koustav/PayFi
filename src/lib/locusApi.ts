import { FEATURE_FLAGS } from './featureFlags';

export async function sendEmailAction(payload: any) {
  if (FEATURE_FLAGS.USE_LOCUS_API) {
    // Real Locus Integration
    const res = await fetch('/api/locus/email', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.json();
  } else {
    // Mock Action
    console.log('[MOCK] Sending Email via Draft...', payload);
    return new Promise(resolve => setTimeout(() => resolve({ success: true }), 1000));
  }
}

export async function escalateTaskAction(taskId: string) {
  if (FEATURE_FLAGS.USE_LOCUS_API) {
    // Real Locus Integration
    const res = await fetch(`/api/locus/escalate/${taskId}`, { method: 'POST' });
    return res.json();
  } else {
    // Mock Action
    console.log(`[MOCK] Escalating task ${taskId} to Agent Support...`);
    return new Promise(resolve => setTimeout(() => resolve({ success: true, status: 'escalated' }), 1000));
  }
}
