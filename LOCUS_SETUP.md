# Locus Integration Setup

This document explains how to set up and use the Locus integration in your PayFi application.

## Overview

The Locus integration provides server-side functionality for:
- **generateCancellationEmail()** - Send cancellation emails via AgentMail
- **submitHumanTask()** - Submit tasks for human review/approval
- **sendRecoveredPayout()** - Send USDC payments via email or wallet address
- **recordLedgerEvent()** - Record transaction events for tracking

## Setup Instructions

### 1. Environment Configuration

Create a `.env.local` file in your project root with the following variables:

```env
# Locus Configuration
LOCUS_API_KEY=your_locus_api_key_here
LOCUS_BASE_URL=https://beta-api.paywithlocus.com/api

# Feature Flags
LOCUS_MOCK_MODE=true
LOCUS_ENABLE_EMAILS=true
LOCUS_ENABLE_PAYMENTS=true
LOCUS_ENABLE_HUMAN_TASKS=true
```

### 2. Get Your Locus API Key

1. Visit [Locus Onboarding](https://beta.paywithlocus.com/onboarding.md)
2. Follow the instructions to get your API key
3. Your API key will start with `claw_`
4. Add it to your `.env.local` file

### 3. Feature Flags

- **LOCUS_MOCK_MODE**: Set to `true` for testing without real API calls
- **LOCUS_ENABLE_EMAILS**: Enable/disable email functionality
- **LOCUS_ENABLE_PAYMENTS**: Enable/disable payment functionality  
- **LOCUS_ENABLE_HUMAN_TASKS**: Enable/disable human task functionality

## API Endpoints

### Generate Cancellation Email
```
POST /api/locus/email
Content-Type: application/json

{
  "subscriptionName": "Netflix",
  "userEmail": "user@example.com",
  "reason": "No longer needed"
}
```

### Submit Human Task
```
POST /api/locus/task
Content-Type: application/json

{
  "title": "Review Refund Request",
  "description": "User requested refund for cancelled subscription",
  "priority": "high",
  "assignee": "finance-team@example.com",
  "dueDate": "2025-01-15T00:00:00Z"
}
```

### Send Recovered Payout
```
POST /api/locus/payout
Content-Type: application/json

{
  "recipient": "user@example.com", // or wallet address
  "amount": 25.50,
  "currency": "USDC",
  "memo": "Recovered payout from cancelled subscription"
}
```

### Record Ledger Event
```
POST /api/locus/ledger
Content-Type: application/json

{
  "type": "refund",
  "amount": 25.50,
  "currency": "USDC",
  "fromAddress": "0xYourWallet...",
  "toAddress": "user@example.com",
  "metadata": {
    "subscriptionId": "netflix_123",
    "cancellationDate": "2025-01-10"
  }
}
```

### Get Status
```
GET /api/locus/status
```

Returns current configuration and balance (if payments enabled).

## Security Considerations

- **Never expose API keys to client-side code**
- All Locus operations are server-side only
- Feature flags allow safe testing in mock mode
- API keys are validated before making requests

## Mock Mode

When `LOCUS_MOCK_MODE=true`:
- No real API calls are made to Locus
- All functions return mock responses
- Useful for development and testing
- API key validation is skipped

## Error Handling

All API endpoints return consistent error responses:
```json
{
  "error": "Error type",
  "message": "Human-readable description",
  "mockMode": true/false
}
```

## Testing

1. Start with `LOCUS_MOCK_MODE=true` to test integration
2. Set your real API key and disable mock mode
3. Test with small amounts first
4. Monitor transaction status via the API

## Support

- [Locus Documentation](https://beta.paywithlocus.com/skill.md)
- [AgentMail Guide](https://beta.paywithlocus.com/agentmail.md)
- [Laso Finance Guide](https://beta.paywithlocus.com/laso.md)

## Important Notes

- All transactions are in USDC on Base network
- Email payments are held in escrow until claimed
- Human tasks use Locus feedback system
- Ledger events are stored as feedback entries
- API keys should never be committed to version control
