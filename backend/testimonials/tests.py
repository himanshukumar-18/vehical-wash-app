from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Testimonial

User = get_user_model()


class TestimonialAPITestCase(APITestCase):
    def setUp(self):
        self.admin_user = User.objects.create_superuser(
            email="admin@test.com", password="adminpassword123", fullname="Admin User", role="admin"
        )
        self.customer_user = User.objects.create_user(
            email="customer@test.com", password="customerpassword123", fullname="Customer User"
        )
        self.t1 = Testimonial.objects.create(
            customer_name="Rohan Sharma",
            customer_title="Honda City Owner",
            rating=5,
            comment="Amazing doorstep foam wash!",
            is_approved=True,
        )
        self.t2 = Testimonial.objects.create(
            customer_name="Priya Singh",
            customer_title="Creta Owner",
            rating=4,
            comment="Very convenient service.",
            is_approved=False,
        )

    def test_public_list_only_approved(self):
        res = self.client.get("/api/testimonials/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.data.get("results", res.data)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["customer_name"], "Rohan Sharma")

    def test_customer_submit_feedback(self):
        payload = {
            "customer_name": "Amit Kumar",
            "customer_title": "Fortuner Owner",
            "rating": 5,
            "comment": "Super clean finish and prompt arrival!",
        }
        res = self.client.post("/api/testimonials/", payload)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(res.data["success"])

        # Check DB — must be is_approved=False
        new_item = Testimonial.objects.get(customer_name="Amit Kumar")
        self.assertFalse(new_item.is_approved)

    def test_admin_approve_and_delete(self):
        self.client.force_authenticate(user=self.admin_user)

        # Approve t2
        approve_res = self.client.post(f"/api/admin/testimonials/{self.t2.id}/approve/")
        self.assertEqual(approve_res.status_code, status.HTTP_200_OK)
        self.t2.refresh_from_db()
        self.assertTrue(self.t2.is_approved)

        # Delete t1
        delete_res = self.client.delete(f"/api/admin/testimonials/{self.t1.id}/")
        self.assertEqual(delete_res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Testimonial.objects.filter(id=self.t1.id).exists())
