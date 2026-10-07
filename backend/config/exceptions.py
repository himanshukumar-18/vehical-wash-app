from rest_framework.views import exception_handler
from rest_framework.exceptions import ValidationError, NotAuthenticated, PermissionDenied, NotFound, Throttled
from rest_framework.response import Response
from rest_framework import status

def custom_exception_handler(exc, context):
    # Call DRF default exception handler first to get the standard error response
    response = exception_handler(exc, context)

    if response is not None:
        code = "ERROR"
        message = "An error occurred."
        errors = response.data

        if isinstance(exc, ValidationError):
            code = "VALIDATION_ERROR"
            message = "Validation failed. Please check the submitted data."
        elif isinstance(exc, NotAuthenticated):
            code = "AUTHENTICATION_REQUIRED"
            message = "Authentication credentials were not provided."
        elif isinstance(exc, PermissionDenied):
            code = "PERMISSION_DENIED"
            message = "You do not have permission to perform this action."
        elif isinstance(exc, NotFound):
            code = "NOT_FOUND"
            message = "The requested resource was not found."
        elif isinstance(exc, Throttled):
            code = "RATE_LIMIT_EXCEEDED"
            wait = getattr(exc, "wait", None)
            message = f"Request limit exceeded. Available in {wait} seconds." if wait else "Request limit exceeded."

        response.data = {
            "success": False,
            "message": message,
            "code": code,
            "errors": errors,
        }
        return response

    # Handle unhandled server exceptions safely without leaking internal traces
    return Response(
        {
            "success": False,
            "message": "An internal server error occurred. Please try again later.",
            "code": "INTERNAL_SERVER_ERROR",
            "errors": None,
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
