import logging
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError
from django.http import Http404
from rest_framework import status
from rest_framework.exceptions import (
    APIException,
    AuthenticationFailed,
    MethodNotAllowed,
    NotAuthenticated,
    NotFound,
    ParseError,
    PermissionDenied,
    Throttled,
    ValidationError as DRFValidationError,
)
from rest_framework.response import Response
from rest_framework.views import exception_handler

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Standardized production-ready DRF exception handler.
    All error responses follow:
    {
        "success": false,
        "message": "...",
        "code": "...",
        "errors": { ... } or null
    }
    """
    # Convert Django exceptions to DRF exceptions where applicable
    if isinstance(exc, DjangoValidationError):
        if hasattr(exc, "message_dict"):
            exc = DRFValidationError(detail=exc.message_dict)
        elif hasattr(exc, "messages"):
            exc = DRFValidationError(detail={"non_field_errors": exc.messages})
        else:
            exc = DRFValidationError(detail=str(exc))
    elif isinstance(exc, Http404):
        exc = NotFound(detail="Resource not found.")
    elif isinstance(exc, IntegrityError):
        logger.warning("Database integrity error: %s", exc)
        return Response(
            {
                "success": False,
                "message": "A database constraint violation occurred.",
                "code": "IDEMPOTENCY_CONFLICT",
                "errors": None,
            },
            status=status.HTTP_409_CONFLICT,
        )

    # Call DRF's default exception handler to get the standard response object
    response = exception_handler(exc, context)

    if response is not None:
        code = "ERROR"
        message = "An error occurred."
        errors = None

        if isinstance(exc, DRFValidationError):
            code = "VALIDATION_ERROR"
            message = "Validation failed."
            errors = response.data
        elif isinstance(exc, NotAuthenticated):
            code = "AUTHENTICATION_REQUIRED"
            message = "Authentication credentials were not provided."
        elif isinstance(exc, AuthenticationFailed):
            code = "INVALID_CREDENTIALS"
            message = "Invalid authentication credentials."
        elif isinstance(exc, PermissionDenied):
            code = "PERMISSION_DENIED"
            message = "You do not have permission to perform this action."
        elif isinstance(exc, NotFound):
            code = "RESOURCE_NOT_FOUND"
            message = "The requested resource was not found."
        elif isinstance(exc, MethodNotAllowed):
            code = "METHOD_NOT_ALLOWED"
            message = f"Method '{context['request'].method}' not allowed."
        elif isinstance(exc, Throttled):
            code = "RATE_LIMIT_EXCEEDED"
            wait_sec = int(exc.wait) if exc.wait is not None else 60
            message = f"Too many requests. Please wait {wait_sec} seconds before trying again."
        elif isinstance(exc, ParseError):
            code = "PARSE_ERROR"
            message = "Malformed request payload."
        elif isinstance(exc, APIException):
            code = getattr(exc, "default_code", "API_ERROR").upper()
            if isinstance(response.data, dict) and "detail" in response.data:
                message = str(response.data["detail"])
            elif isinstance(response.data, str):
                message = response.data

        response.data = {
            "success": False,
            "message": message,
            "code": code,
            "errors": errors,
        }
        return response

    # Handle unhandled unexpected exceptions securely (500 Internal Server Error)
    logger.exception("Unhandled server exception: %s", exc)
    return Response(
        {
            "success": False,
            "message": "An internal server error occurred. Please try again later.",
            "code": "INTERNAL_SERVER_ERROR",
            "errors": None,
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
