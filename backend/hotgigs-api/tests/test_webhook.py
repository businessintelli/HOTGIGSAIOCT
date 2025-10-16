"""
Webhook Testing Script for Resend Email Events

This script simulates webhook events from Resend to test the webhook handler locally.
Run this script while the backend server is running to test webhook functionality.

Usage:
    python3 tests/test_webhook.py
"""

import requests
import json
from datetime import datetime

# Base URL for the API
BASE_URL = "http://localhost:8000"

# Sample webhook payloads for different event types
WEBHOOK_PAYLOADS = {
    "email.sent": {
        "type": "email.sent",
        "created_at": datetime.now().isoformat(),
        "data": {
            "email_id": "test-email-123",
            "to": ["test@example.com"],
            "from": "noreply@hotgigs.com",
            "subject": "Test Email",
            "created_at": datetime.now().isoformat()
        }
    },
    
    "email.delivered": {
        "type": "email.delivered",
        "created_at": datetime.now().isoformat(),
        "data": {
            "email_id": "test-email-123",
            "to": ["test@example.com"],
            "from": "noreply@hotgigs.com",
            "subject": "Test Email",
            "delivered_at": datetime.now().isoformat()
        }
    },
    
    "email.opened": {
        "type": "email.opened",
        "created_at": datetime.now().isoformat(),
        "data": {
            "email_id": "test-email-123",
            "to": ["test@example.com"],
            "from": "noreply@hotgigs.com",
            "subject": "Test Email",
            "opened_at": datetime.now().isoformat(),
            "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
    },
    
    "email.clicked": {
        "type": "email.clicked",
        "created_at": datetime.now().isoformat(),
        "data": {
            "email_id": "test-email-123",
            "to": ["test@example.com"],
            "from": "noreply@hotgigs.com",
            "subject": "Test Email",
            "link": "https://hotgigs.ai/dashboard",
            "clicked_at": datetime.now().isoformat(),
            "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
    },
    
    "email.bounced": {
        "type": "email.bounced",
        "created_at": datetime.now().isoformat(),
        "data": {
            "email_id": "test-email-123",
            "to": ["invalid@example.com"],
            "from": "noreply@hotgigs.com",
            "subject": "Test Email",
            "bounce_type": "hard",
            "bounced_at": datetime.now().isoformat(),
            "reason": "Invalid email address"
        }
    },
    
    "email.complained": {
        "type": "email.complained",
        "created_at": datetime.now().isoformat(),
        "data": {
            "email_id": "test-email-123",
            "to": ["user@example.com"],
            "from": "noreply@hotgigs.com",
            "subject": "Test Email",
            "complained_at": datetime.now().isoformat()
        }
    },
    
    "email.delivery_delayed": {
        "type": "email.delivery_delayed",
        "created_at": datetime.now().isoformat(),
        "data": {
            "email_id": "test-email-123",
            "to": ["test@example.com"],
            "from": "noreply@hotgigs.com",
            "subject": "Test Email",
            "delayed_at": datetime.now().isoformat(),
            "reason": "Temporary server error"
        }
    }
}

def test_webhook_event(event_type):
    """Test a specific webhook event"""
    print(f"\n{'='*60}")
    print(f"Testing webhook event: {event_type}")
    print(f"{'='*60}")
    
    payload = WEBHOOK_PAYLOADS.get(event_type)
    if not payload:
        print(f"❌ Unknown event type: {event_type}")
        return False
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/webhooks/resend",
            json=payload,
            headers={
                "Content-Type": "application/json",
                "svix-id": "test-webhook-id",
                "svix-timestamp": str(int(datetime.now().timestamp())),
                "svix-signature": "test-signature"
            }
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            print(f"✅ {event_type} webhook test passed")
            return True
        else:
            print(f"❌ {event_type} webhook test failed")
            return False
            
    except Exception as e:
        print(f"❌ Error testing {event_type}: {str(e)}")
        return False

def test_all_webhooks():
    """Test all webhook event types"""
    print("\n" + "="*60)
    print("RESEND WEBHOOK TESTING SUITE")
    print("="*60)
    
    results = {}
    for event_type in WEBHOOK_PAYLOADS.keys():
        results[event_type] = test_webhook_event(event_type)
    
    # Print summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for result in results.values() if result)
    total = len(results)
    
    for event_type, result in results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{event_type:30} {status}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    return passed == total

if __name__ == "__main__":
    # Check if server is running
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"✅ Backend server is running at {BASE_URL}")
    except requests.exceptions.ConnectionError:
        print(f"❌ Backend server is not running at {BASE_URL}")
        print("Please start the server with: python3 -m uvicorn src.main:app --reload")
        exit(1)
    
    # Run all webhook tests
    success = test_all_webhooks()
    
    if success:
        print("\n🎉 All webhook tests passed!")
        exit(0)
    else:
        print("\n⚠️  Some webhook tests failed. Please check the logs.")
        exit(1)

