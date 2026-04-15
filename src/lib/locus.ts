// Locus Integration Service
// Server-side only - never expose API keys to client

interface LocusConfig {
  apiKey: string;
  baseUrl: string;
  mockMode: boolean;
  enableEmails: boolean;
  enablePayments: boolean;
  enableHumanTasks: boolean;
}

interface EmailRequest {
  to: string;
  subject: string;
  body: string;
  from?: string;
}

interface HumanTaskRequest {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  dueDate?: string;
}

interface PayoutRequest {
  recipient: string;
  amount: number;
  currency?: string;
  memo?: string;
}

interface LedgerEvent {
  type: string;
  amount: number;
  currency: string;
  fromAddress?: string;
  toAddress?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

class LocusService {
  private config: LocusConfig;

  constructor() {
    this.config = {
      apiKey: process.env.LOCUS_API_KEY || '',
      baseUrl: process.env.LOCUS_BASE_URL || 'https://beta-api.paywithlocus.com/api',
      mockMode: process.env.LOCUS_MOCK_MODE === 'true',
      enableEmails: process.env.LOCUS_ENABLE_EMAILS === 'true',
      enablePayments: process.env.LOCUS_ENABLE_PAYMENTS === 'true',
      enableHumanTasks: process.env.LOCUS_ENABLE_HUMAN_TASKS === 'true',
    };

    if (!this.config.apiKey && !this.config.mockMode) {
      console.warn('LOCUS_API_KEY not found, falling back to mock mode');
      this.config.mockMode = true;
    }
  }

  private async makeRequest(endpoint: string, data?: any, method: string = 'GET'): Promise<any> {
    if (this.config.mockMode) {
      return this.mockResponse(endpoint, method);
    }

    const url = `${this.config.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        throw new Error(`Locus API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Locus API request failed:', error);
      throw error;
    }
  }

  private mockResponse(endpoint: string, method: string): any {
    console.log(`[MOCK] ${method} ${endpoint}`);
    
    switch (endpoint) {
      case '/pay/send':
      case '/pay/send-email':
        return {
          success: true,
          data: {
            transaction_id: `mock_tx_${Date.now()}`,
            status: 'COMPLETED',
            amount: 10.50,
            token: 'USDC',
          },
        };
      case '/feedback':
        return { success: true };
      default:
        return { success: true, data: { message: 'Mock response' } };
    }
  }

  // Generate cancellation email using AgentMail
  async generateCancellationEmail(subscriptionName: string, userEmail: string, reason?: string): Promise<EmailRequest> {
    if (!this.config.enableEmails) {
      throw new Error('Email functionality is disabled');
    }

    const subject = `Subscription Cancelled: ${subscriptionName}`;
    const body = `
Dear User,

Your subscription for ${subscriptionName} has been successfully cancelled.

${reason ? `Reason: ${reason}` : ''}

If this was a mistake or you need assistance, please contact our support team.

Best regards,
PayFi Team
    `.trim();

    const emailRequest: EmailRequest = {
      to: userEmail,
      subject,
      body,
      from: 'noreply@payfi.com',
    };

    if (!this.config.mockMode) {
      // Use AgentMail to send the email
      try {
        await this.makeRequest('/agentmail/send', {
          to: userEmail,
          subject,
          body,
          from: 'noreply@payfi.com',
        }, 'POST');
      } catch (error) {
        console.error('Failed to send cancellation email:', error);
        throw error;
      }
    }

    return emailRequest;
  }

  // Submit human task for review/approval
  async submitHumanTask(task: HumanTaskRequest): Promise<any> {
    if (!this.config.enableHumanTasks) {
      throw new Error('Human task functionality is disabled');
    }

    const feedbackData = {
      category: 'general',
      endpoint: '/human-task',
      message: `Human Task: ${task.title}`,
      context: {
        title: task.title,
        description: task.description,
        priority: task.priority,
        assignee: task.assignee,
        dueDate: task.dueDate,
      },
      source: 'manual',
    };

    return await this.makeRequest('/feedback', feedbackData, 'POST');
  }

  // Send recovered payout via Locus
  async sendRecoveredPayout(payout: PayoutRequest): Promise<any> {
    if (!this.config.enablePayments) {
      throw new Error('Payment functionality is disabled');
    }

    // Check if recipient is an email address or wallet address
    const isEmail = payout.recipient.includes('@');
    
    if (isEmail) {
      // Send via email
      return await this.makeRequest('/pay/send-email', {
        email: payout.recipient,
        amount: payout.amount,
        memo: payout.memo || 'Recovered payout from cancelled subscription',
        expires_in_days: 30,
      }, 'POST');
    } else {
      // Send to wallet address
      return await this.makeRequest('/pay/send', {
        to_address: payout.recipient,
        amount: payout.amount,
        memo: payout.memo || 'Recovered payout from cancelled subscription',
      }, 'POST');
    }
  }

  // Record ledger event for tracking
  async recordLedgerEvent(event: LedgerEvent): Promise<any> {
    const feedbackData = {
      category: 'general',
      endpoint: '/ledger-event',
      message: `Ledger Event: ${event.type}`,
      context: {
        type: event.type,
        amount: event.amount,
        currency: event.currency,
        fromAddress: event.fromAddress,
        toAddress: event.toAddress,
        metadata: event.metadata,
        timestamp: event.timestamp,
      },
      source: 'manual',
    };

    return await this.makeRequest('/feedback', feedbackData, 'POST');
  }

  // Helper method to check transaction status
  async getTransactionStatus(transactionId: string): Promise<any> {
    return await this.makeRequest(`/pay/transaction/${transactionId}`);
  }

  // Helper method to get balance
  async getBalance(): Promise<any> {
    return await this.makeRequest('/pay/balance');
  }

  // Feature flag getters
  isMockMode(): boolean {
    return this.config.mockMode;
  }

  areEmailsEnabled(): boolean {
    return this.config.enableEmails;
  }

  arePaymentsEnabled(): boolean {
    return this.config.enablePayments;
  }

  areHumanTasksEnabled(): boolean {
    return this.config.enableHumanTasks;
  }
}

// Singleton instance
const locusService = new LocusService();

export default locusService;
export type { EmailRequest, HumanTaskRequest, PayoutRequest, LedgerEvent };
