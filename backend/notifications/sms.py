import logging
import re
import requests
from django.conf import settings

logger = logging.getLogger(__name__)

def normalize_phone_number(phone_raw):
    if not phone_raw:
        return ""
    cleaned = re.sub(r"[^\d+]", "", str(phone_raw).strip())
    # Format standard 10-digit Indian phone numbers to E.164
    if len(cleaned) == 10 and not cleaned.startswith("+"):
        return f"+91{cleaned}"
    if cleaned.startswith("91") and len(cleaned) == 12 and not cleaned.startswith("+"):
        return f"+{cleaned}"
    if cleaned.startswith("+91") and len(cleaned) == 13:
        return cleaned
    if cleaned.startswith("+") and len(cleaned) >= 10:
        return cleaned
    return cleaned

def send_msg91_otp(phone_number, otp_code):
    provider = getattr(settings, "SMS_PROVIDER", "mock").lower()
    if provider == "mock":
        logger.info("Mock SMS provider: simulated OTP dispatch.")
        return True

    api_key = getattr(settings, "MSG91_API_KEY", "")
    template_id = getattr(settings, "MSG91_TEMPLATE_ID", "")
    
    if not api_key or not template_id:
        logger.error("MSG91 credentials or template ID missing in configuration.")
        return False

    # Extract digits with country code for MSG91 (e.g. 919876543210)
    digits = re.sub(r"\D", "", phone_number)
    if len(digits) == 10:
        digits = f"91{digits}"

    url = "https://control.msg91.com/api/v5/otp"
    headers = {
        "authkey": api_key,
        "Content-Type": "application/json",
    }
    payload = {
        "template_id": template_id,
        "mobile": digits,
        "otp": str(otp_code),
    }

    sender_id = getattr(settings, "MSG91_SENDER_ID", "")
    if sender_id:
        payload["sender"] = sender_id

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=5)
        if response.status_code == 200:
            res_data = response.json()
            if res_data.get("type") == "success" or res_data.get("message") == "OTP sent successfully":
                return True
        logger.error("MSG91 responded with status code %d", response.status_code)
        return False
    except Exception as exc:
        logger.error("MSG91 dispatch failed: %s", exc.__class__.__name__)
        return False
