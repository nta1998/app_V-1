import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import User
from accounts.serializers import UserSerializer
from django.conf import settings

print(f"AUTH_USER_MODEL: {settings.AUTH_USER_MODEL}")

try:
    user = User.objects.first()
    if user:
        print(f"Found user: {user} (type: {type(user)})")
        
        # Test 1: Direct Save
        print("--- Testing Direct Save ---")
        user.full_name = "Debug Direct Save"
        user.save()
        print("Direct save successful.")
        
        # Test 2: Serializer Save
        print("--- Testing Serializer Save ---")
        serializer = UserSerializer(user, data={'full_name': 'Debug Serializer Save'}, partial=True)
        if serializer.is_valid():
            serializer.save()
            print("Serializer save successful.")
        else:
            print(f"Serializer errors: {serializer.errors}")

    else:
        print("No user found to test.")
except Exception as e:
    import traceback
    traceback.print_exc()
