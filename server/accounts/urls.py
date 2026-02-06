from django.urls import path
from .views import login_view, user_profile_view, users_list_view

urlpatterns = [
    path('login/', login_view, name='login'),
    path('profile/', user_profile_view, name='profile'),
    path('users/', users_list_view, name='users-list'),
]
