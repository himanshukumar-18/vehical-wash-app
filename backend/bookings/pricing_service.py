from decimal import Decimal
from dataclasses import dataclass
from typing import Optional, Dict, Any
from django.core.exceptions import ValidationError

from services.models import Service
from service_areas.models import ServiceArea
from offers.models import Offer


@dataclass
class PricingResult:
    service_price: Decimal
    travel_charge: Decimal
    subtotal: Decimal
    discount: Decimal
    tax: Decimal
    final_amount: Decimal
    currency: str
    service_area: Optional[ServiceArea]
    offer: Optional[Offer]
    offer_name: str
    service_area_name: str
    is_service_area_supported: bool
    service_area_message: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "service_price": float(self.service_price),
            "travel_charge": float(self.travel_charge),
            "subtotal": float(self.subtotal),
            "discount": float(self.discount),
            "tax": float(self.tax),
            "final_amount": float(self.final_amount),
            "currency": self.currency,
            "service_area": {
                "id": self.service_area.id,
                "name": self.service_area.name,
                "city": self.service_area.city,
                "travel_charge": float(self.service_area.travel_charge),
            } if self.service_area else None,
            "offer": {
                "id": self.offer.id,
                "name": self.offer.name,
                "discount_type": self.offer.discount_type,
                "discount_value": float(self.offer.discount_value),
                "discount_amount": float(self.discount),
            } if self.offer else None,
            "offer_name": self.offer_name,
            "service_area_name": self.service_area_name,
            "is_service_area_supported": self.is_service_area_supported,
            "service_area_message": self.service_area_message,
        }


class BookingPricingService:
    """
    SINGLE SOURCE OF TRUTH FOR ALL BOOKING PRICING CALCULATIONS.
    Enforces:
    1. Service Price retrieval from DB
    2. Active Service Area detection & travel charge application
    3. Automatic selection of the SINGLE BEST ELIGIBLE OFFER providing maximum discount
    4. Safe Decimal arithmetic for all monetary values
    """

    @staticmethod
    def find_matching_service_area(address_text: str, lat: float = None, lng: float = None) -> Optional[ServiceArea]:
        """
        Find matching active ServiceArea for customer location.
        Priority:
        1. Explicit Pincode match (e.g. 825301)
        2. Area name / Keyword match (e.g. Matwari, Korrah)
        3. Active fallback area
        """
        active_areas = list(ServiceArea.objects.filter(is_active=True).order_by("-travel_charge", "display_order"))
        if not active_areas:
            if not ServiceArea.objects.exists():
                area, _ = ServiceArea.objects.get_or_create(
                    name="Hazaribagh Central",
                    defaults={"city": "Hazaribagh", "travel_charge": Decimal("50.00"), "pincodes": "825301, 825302", "is_active": True},
                )
                return area
            return None

        addr_lower = (address_text or "").strip().lower()

        # Explicit non-Hazaribagh cities check
        unsupported_cities = [
            "ranchi", "patna", "dhanbad", "bokaro", "jamshedpur",
            "ramgarh", "giridih", "kolkata", "delhi", "mumbai",
            "bangalore", "hyderabad", "chennai", "pune", "ahmedabad"
        ]
        if any(city_name in addr_lower for city_name in unsupported_cities) and "hazaribagh" not in addr_lower:
            return None

        # Pass 1: Specific Pincode Match (e.g. 825301)
        if address_text:
            for area in active_areas:
                if area.pincodes:
                    pincode_list = [p.strip() for p in area.pincodes.split(",") if p.strip()]
                    for pin in pincode_list:
                        if pin and pin in address_text:
                            return area

        # Pass 2: Specific Area Name / Keyword Match (e.g. Matwari, Korrah)
        if addr_lower:
            for area in active_areas:
                keywords = [k.strip().lower() for k in area.name.split(",") if k.strip()]
                for kw in keywords:
                    if kw and len(kw) > 2 and kw in addr_lower:
                        return area

        # Pass 3: Active Hazaribagh area fallback
        return active_areas[0]

    @classmethod
    def calculate(
        cls,
        service: Service,
        address: str,
        customer=None,
        lat: float = None,
        lng: float = None,
        booking_date=None,
    ) -> PricingResult:
        """
        Calculate complete price breakdown.
        """
        if not service or not service.is_active:
            raise ValidationError("Selected service is inactive or invalid.")

        service_price = Decimal(str(service.price))

        # 1. Determine Service Area & Travel Charge
        service_area = cls.find_matching_service_area(address, lat, lng)
        if not service_area:
            return PricingResult(
                service_price=service_price,
                travel_charge=Decimal("0.00"),
                subtotal=service_price,
                discount=Decimal("0.00"),
                tax=Decimal("0.00"),
                final_amount=service_price,
                currency="INR",
                service_area=None,
                offer=None,
                offer_name="",
                service_area_name="Outside Hazaribagh",
                is_service_area_supported=False,
                service_area_message="Doorstep car wash is currently unavailable in your location area. We operate exclusively in Hazaribagh right now, but we will be expanding to your city soon!",
            )

        travel_charge = Decimal(str(service_area.travel_charge))
        subtotal = service_price + travel_charge

        # 2. Evaluate Automatic Best Eligible Offer
        best_offer = None
        best_discount = Decimal("0.00")

        active_offers = Offer.objects.filter(is_active=True).order_by("display_order", "-created_at")
        for offer in active_offers:
            is_eligible, _ = offer.is_eligible(
                customer=customer,
                service=service,
                service_area=service_area,
                subtotal=subtotal,
            )
            if is_eligible:
                disc_amount = offer.calculate_discount(subtotal)
                if disc_amount > best_discount:
                    best_discount = disc_amount
                    best_offer = offer

        from .utils import calculate_tax

        # Round discount and calculate final total safely
        best_discount = min(best_discount, subtotal).quantize(Decimal("0.01"))
        tax = calculate_tax(service_price)
        final_amount = (subtotal - best_discount + tax).quantize(Decimal("0.01"))

        return PricingResult(
            service_price=service_price.quantize(Decimal("0.01")),
            travel_charge=travel_charge.quantize(Decimal("0.01")),
            subtotal=subtotal.quantize(Decimal("0.01")),
            discount=best_discount,
            tax=tax,
            final_amount=final_amount,
            currency="INR",
            service_area=service_area,
            offer=best_offer,
            offer_name=best_offer.name if best_offer else "",
            service_area_name=service_area.name if service_area else "",
            is_service_area_supported=True,
            service_area_message="Service available in your area.",
        )
