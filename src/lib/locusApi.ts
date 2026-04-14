'use server';

import * as fs from 'fs';
import { FEATURE_FLAGS } from './featureFlags';

function getCredentials() {
  const credsPath = '/Users/koustav/.config/locus/credentials.json';
  if (!fs.existsSync(credsPath)) throw new Error("No Locus credentials found at " + credsPath);
  return JSON.parse(fs.readFileSync(credsPath, 'utf8'));
}

async function getOrCreateInbox(creds: any) {
  const inboxPath = '/Users/koustav/.config/locus/inbox.json';
  if (fs.existsSync(inboxPath)) {
    return JSON.parse(fs.readFileSync(inboxPath, 'utf8'));
  }

  const res = await fetch(`${creds.api_base}/x402/agentmail-create-inbox`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${creds.api_key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username: 'subsaver-agent' })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || data.error);
  
  fs.writeFileSync(inboxPath, JSON.stringify(data.data));
  return data.data;
}

// ----------------------------------------------------
// Core Agent functions from previous steps
// ----------------------------------------------------

export async function sendEmailAction(payload: { to: string; subject: string; body: string }) {
  if (FEATURE_FLAGS.USE_LOCUS_API) {
    const creds = getCredentials();
    const inbox = await getOrCreateInbox(creds);
    const inboxId = inbox.inboxId || inbox.inbox_id;

    const res = await fetch(`${creds.api_base}/x402/agentmail-send-message`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${creds.api_key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inbox_id: inboxId,
        to: [{ email: payload.to }],
        subject: payload.subject,
        body: payload.body
      })
    });
    return res.json();
  } else {
    console.log('[MOCK] Sending Email via Draft...', payload);
    return new Promise(resolve => setTimeout(() => resolve({ success: true }), 1000));
  }
}

export async function escalateTaskAction(taskId: string) {
  return submitHumanTask(taskId, "Escalated from UI button");
}

// ----------------------------------------------------
// Newly Request Integration Layer
// ----------------------------------------------------

export async function generateCancellationEmail(merchant: string, amount: number) {
  if (FEATURE_FLAGS.USE_LOCUS_API) {
    try {
      const creds = getCredentials();
      // Using Locus Wrapped APIs to call OpenAI securely via Server-Side proxy
      const res = await fetch(`${creds.api_base}/wrapped/openai/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${creds.api_key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: `Write a short, professional email to cancel my ${merchant} subscription that charged $${amount.toFixed(2)}. Make it concise and request a refund.` }]
        })
      });
      
      if (res.ok) {
         const data = await res.json();
         if (data.success && data.data?.choices?.[0]?.message?.content) {
           return data.data.choices[0].message.content;
         }
      }
    } catch (e) {
      console.error("Locus LLM wrapping failed, falling back to basic string generation", e);
    }
  } 
  
  // Mock / deterministic fallback
  return `Hello ${merchant} Support,\n\nI am formally requesting the cancellation of my subscription and a refund for the unauthorized charge of $${amount.toFixed(2)}.\n\nBest,\n[Your Name]`;
}

export async function submitHumanTask(taskId: string, reason: string) {
  if (FEATURE_FLAGS.USE_LOCUS_API) {
    const creds = getCredentials();
    const inbox = await getOrCreateInbox(creds);
    const inboxId = inbox.inboxId || inbox.inbox_id;

    const res = await fetch(`${creds.api_base}/x402/agentmail-send-message`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${creds.api_key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inbox_id: inboxId,
        to: [{ email: 'escalations@subsaver.com' }],
        subject: `ACTION REQUIRED: Task ${taskId}`,
        body: `Automated agent requires human intervention for task: ${taskId}\n\nReason: ${reason}`
      })
    });
    return res.json();
  } else {
    console.log(`[MOCK] Task ${taskId} submitted to human queue. Reason: ${reason}`);
    return new Promise(resolve => setTimeout(() => resolve({ success: true, status: 'mock_queued' }), 500));
  }
}

export async function sendRecoveredPayout(address: string, amount: number, memo: string) {
  if (FEATURE_FLAGS.USE_LOCUS_API) {
    const creds = getCredentials();
    
    // Uses standard Locus Base USDC Payments
    const res = await fetch(`${creds.api_base}/pay/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${creds.api_key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to_address: address,
        amount: amount,
        memo: memo || 'Payout for recovered subscription via SubSaver'
      })
    });
    return res.json();
  } else {
    console.log(`[MOCK] Sent $${amount.toFixed(2)} USDC payout to ${address}`);
    return new Promise(resolve => setTimeout(() => resolve({ success: true, status: 'mock_sent' }), 1000));
  }
}

export async function recordLedgerEvent(eventStr: string) {
  if (FEATURE_FLAGS.USE_LOCUS_API) {
    // Write securely to server-only hidden config
    const ledgerPath = '/Users/koustav/.config/locus/ledger.json';
    let ledger = [];
    if (fs.existsSync(ledgerPath)) {
      ledger = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));
    }
    ledger.push({ timestamp: new Date().toISOString(), event: eventStr });
    fs.writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2));
    return { success: true };
  } else {
    console.log(`[MOCK LEDGER] Recorded: ${eventStr}`);
    return { success: true };
  }
}
