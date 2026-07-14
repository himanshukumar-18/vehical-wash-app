from django.apps import AppConfig


class BookingsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "bookings"
    verbose_name = "Bookings"

    def ready(self):
        """
        Import signals when the application starts.
        """
        import bookings.signals