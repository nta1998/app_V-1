from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from .serializers import UserSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    # Support both 'username' (from standard login forms) and 'email' keys
    email = request.data.get('username') or request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response({'error': 'Please provide both email and password'}, status=status.HTTP_400_BAD_REQUEST)

    # Standardize email to lowercase for case-insensitive matching if desired, 
    # though usually email matching is case-sensitive or handled by backend.
    email = email.lower()

    # Authenticate
    # We explicitly pass the request and map email to the 'username' argument 
    # because ModelBackend expects the identifier as the username arg.
    user = authenticate(request=request, username=email, password=password)

    if user:
        token, _ = Token.objects.get_or_create(user=user)
        # Pass request context to serializer for absolute URLs
        user_data = UserSerializer(user, context={'request': request}).data
        return Response({
            'token': token.key,
            'user': user_data
        })
    else:
        # Debugging aid: check why it failed
        from django.contrib.auth import get_user_model
        User = get_user_model()
        try:
            u = User.objects.get(email=email)
            print(f"Login failed for {email}: Password incorrect")
        except User.DoesNotExist:
            print(f"Login failed for {email}: User not found")

        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET', 'PATCH'])
@permission_classes([permissions.IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def user_profile_view(request):
    if request.method == 'GET':
        serializer = UserSerializer(request.user, context={'request': request})
        return Response(serializer.data)
    
    elif request.method == 'PATCH':
        serializer = UserSerializer(request.user, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def users_list_view(request):
    """
    List all users.
    Only authenticated users can access this (maybe restrict to admin in future).
    """
    users = User.objects.all().order_by('-date_joined' if hasattr(User, 'date_joined') else '-created_at')
    serializer = UserSerializer(users, many=True, context={'request': request})
    return Response(serializer.data)
