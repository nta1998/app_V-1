"""
Step 1: Property Browsing
=========================
Verify that authenticated users can browse all available projects and apartments.
Unauthenticated users should be rejected.
"""
from unittest.mock import patch

from rest_framework import status

from .base import BaseE2ETestCase
from core.models import Apartment, Project


class TestPropertyBrowsing(BaseE2ETestCase):
    """Users can view all available properties (projects + apartments)."""

    # -----------------------------------------------------------
    # Projects
    # -----------------------------------------------------------

    def test_list_all_projects(self):
        """GET /api/projects/ returns all projects."""
        response = self.user_client.get('/api/projects/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        project = response.data[0]
        self.assertEqual(project['project_address'], 'Test Project, Tel Aviv')
        self.assertIn('title', project)
        self.assertIn('percentage', project)
        self.assertIn('documents', project)

    def test_project_detail(self):
        """GET /api/projects/{id}/ returns full project with documents."""
        response = self.user_client.get(f'/api/projects/{self.project.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['project_description'], 'Premium project in central Tel Aviv')
        self.assertIn('documents', response.data)

    # -----------------------------------------------------------
    # Apartments
    # -----------------------------------------------------------

    def test_list_all_apartments(self):
        """GET /api/apartments/ returns all apartments with nested project."""
        response = self.user_client.get('/api/apartments/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        apt = response.data[0]
        self.assertIn('project', apt)
        self.assertEqual(apt['project']['project_address'], 'Test Project, Tel Aviv')

    def test_filter_apartments_by_project(self):
        """GET /api/apartments/?project_id=X returns only matching apartments."""
        response = self.user_client.get(f'/api/apartments/?project_id={self.project.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    @patch('core.models.Nominatim')
    def test_filter_apartments_empty_for_other_project(self, mock_nominatim):
        """Filtering by a project with no apartments returns empty list."""
        mock_nominatim.return_value.geocode.return_value = None
        other_project = Project.objects.create(project_address='Empty Project')
        response = self.user_client.get(f'/api/apartments/?project_id={other_project.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_apartment_detail_includes_full_info(self):
        """GET /api/apartments/{id}/ returns price, rooms, floor, size, images."""
        response = self.user_client.get(f'/api/apartments/{self.apartment.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        self.assertEqual(float(data['price']), 2500000.00)
        self.assertEqual(data['number_of_rooms'], 4)
        self.assertEqual(data['floor'], 8)
        self.assertEqual(data['apartment_size_sqm'], 120.0)
        self.assertIn('main_image', data)
        self.assertIn('documents', data)
        self.assertIn('project', data)

    # -----------------------------------------------------------
    # Auth requirements
    # -----------------------------------------------------------

    def test_regular_user_can_browse(self):
        """Authenticated non-admin user can browse projects and apartments."""
        for endpoint in ['/api/projects/', '/api/apartments/']:
            response = self.user_client.get(endpoint)
            self.assertEqual(
                response.status_code, status.HTTP_200_OK,
                f'User should access {endpoint}'
            )

    def test_unauthenticated_cannot_browse(self):
        """Unauthenticated requests are rejected with 401."""
        for endpoint in ['/api/projects/', '/api/apartments/']:
            response = self.anon_client.get(endpoint)
            self.assertEqual(
                response.status_code, status.HTTP_401_UNAUTHORIZED,
                f'Anon should be blocked from {endpoint}'
            )
