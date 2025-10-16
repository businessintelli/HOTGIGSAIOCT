# Webhook Testing Guide

This directory contains scripts for testing the Resend webhook integration locally.

## Prerequisites

1. Backend server must be running on `http://localhost:8000`
2. Python 3.11+ installed
3. `requests` library installed

## Installation

```bash
pip3 install requests
```

## Running the Tests

### Test All Webhook Events

```bash
cd /home/ubuntu/hotgigs/backend/hotgigs-api
python3 tests/test_webhook.py
```

This will test all webhook event types:
- `email.sent`
- `email.delivered`
- `email.opened`
- `email.clicked`
- `email.bounced`
- `email.complained`
- `email.delivery_delayed`

### Expected Output

```
============================================================
RESEND WEBHOOK TESTING SUITE
============================================================

============================================================
Testing webhook event: email.sent
============================================================
Status Code: 200
Response: {'status': 'received', 'event': 'email.sent'}
✅ email.sent webhook test passed

...

============================================================
TEST SUMMARY
============================================================
email.sent                     ✅ PASSED
email.delivered                ✅ PASSED
email.opened                   ✅ PASSED
email.clicked                  ✅ PASSED
email.bounced                  ✅ PASSED
email.complained               ✅ PASSED
email.delivery_delayed         ✅ PASSED

Total: 7/7 tests passed

🎉 All webhook tests passed!
```

## Webhook Event Details

### email.sent
Triggered when an email is successfully sent to Resend's servers.

### email.delivered
Triggered when an email is delivered to the recipient's mail server.

### email.opened
Triggered when a recipient opens the email.

### email.clicked
Triggered when a recipient clicks a link in the email.

### email.bounced
Triggered when an email bounces (hard or soft bounce).

### email.complained
Triggered when a recipient marks the email as spam.

### email.delivery_delayed
Triggered when email delivery is delayed.

## Production Webhook Configuration

Once deployed to production, configure the webhook URL in Resend:

1. Go to https://resend.com/webhooks
2. Click "Add Webhook"
3. Enter your webhook URL: `https://your-domain.com/api/webhooks/resend`
4. Select the events you want to receive
5. Save the webhook

## Webhook Security

In production, implement signature verification:

1. Get your webhook secret from Resend dashboard
2. Add it to `.env` file: `RESEND_WEBHOOK_SECRET=your_secret`
3. Uncomment the signature verification code in `src/api/routes/webhooks.py`

## Troubleshooting

### Server Not Running
```
❌ Backend server is not running at http://localhost:8000
Please start the server with: python3 -m uvicorn src.main:app --reload
```

**Solution:** Start the backend server first.

### Connection Refused
Check if the server is running on the correct port (8000).

### Webhook Tests Failing
Check the server logs for error messages. The webhook handler logs all events.

## Next Steps

1. Deploy backend to production
2. Configure webhook URL in Resend dashboard
3. Monitor webhook events in real-time
4. Integrate webhook data with database for analytics

