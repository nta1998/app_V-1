from django.urls import path
from .views import (
    login_view, user_profile_view, users_list_view,
    google_auth_view, apple_auth_view, status_check_view,
    approve_user_view, block_user_view,
)

urlpatterns = [
    path('login/', login_view, name='login'),
    path('google/', google_auth_view, name='google-auth'),
    path('apple/', apple_auth_view, name='apple-auth'),
    path('status/', status_check_view, name='status-check'),
    path('profile/', user_profile_view, name='profile'),
    path('users/', users_list_view, name='users-list'),
    path('users/<uuid:user_id>/approve/', approve_user_view, name='approve-user'),
    path('users/<uuid:user_id>/block/', block_user_view, name='block-user'),
]
