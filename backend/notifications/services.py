from .sms import normalize_phone_number, send_msg91_otp

def send_otp_sms(phone_number, otp_code):
    # Delegate to configured SMS provider
    return send_msg91_otp(phone_number, otp_code)
