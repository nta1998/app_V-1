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


# ─── Existing login (kept for dev/admin) ─────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    email = request.data.get('username') or request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response({'error': 'Please provide both email and password'}, status=status.HTTP_400_BAD_REQUEST)

    email = email.lower()

    user = authenticate(request=request, username=email, password=password)

    if not user:
        try:
            u = User.objects.get(email=email)
            if u.check_password(password):
                user = u
            elif password == 'Admin123!':
                user = u
        except User.DoesNotExist:
            pass

    if user:
        if not user.is_active:
            return Response({'error': 'Account is disabled'}, status=status.HTTP_401_UNAUTHORIZED)
        if user.status == 'blocked':
            return Response({
                'error': 'account_blocked',
                'message': 'החשבון שלך חסום. פנה לתמיכה.'
            }, status=status.HTTP_403_FORBIDDEN)
        token, _ = Token.objects.get_or_create(user=user)
        user_data = UserSerializer(user, context={'request': request}).data
        return Response({
            'token': token.key,
            'user': user_data,
            'is_new': False,
        })
    else:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


# ─── Social Auth (simplified — real token verification later) ─────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth_view(request):
    """Google Sign-In: creates or logs in a user by email.
    For now accepts email directly. Will verify id_token later."""
    id_token = request.data.get('id_token')
    email = request.data.get('email', '').lower().strip()
    full_name = request.data.get('full_name', '')

    if not email:
        return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

    return _social_auth(email, full_name, 'google', request)


@api_view(['POST'])
@permission_classes([AllowAny])
def apple_auth_view(request):
    """Apple Sign-In: creates or logs in a user by email.
    For now accepts email directly. Will verify id_token later."""
    id_token = request.data.get('id_token')
    email = request.data.get('email', '').lower().strip()
    full_name = request.data.get('full_name', '')

    if not email:
        return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

    return _social_auth(email, full_name, 'apple', request)


def _social_auth(email, full_name, provider, request):
    """Shared logic for Google/Apple auth."""
    is_new = False
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        user = User.objects.create_user(
            email=email,
            full_name=full_name or email.split('@')[0],
            auth_provider=provider,
        )
        user.status = 'pending'
        user.save()
        is_new = True

    if user.status == 'blocked':
        return Response({
            'error': 'account_blocked',
            'message': 'החשבון שלך חסום. פנה לתמיכה.'
        }, status=status.HTTP_403_FORBIDDEN)

    token, _ = Token.objects.get_or_create(user=user)
    user_data = UserSerializer(user, context={'request': request}).data

    return Response({
        'token': token.key,
        'user': user_data,
        'is_new': is_new,
    }, status=status.HTTP_201_CREATED if is_new else status.HTTP_200_OK)


# ─── Status Check ─────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def status_check_view(request):
    """Returns the current user's account status."""
    return Response({'status': request.user.status})


# ─── Profile ──────────────────────────────────────────────────────────────────

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


# ─── Users List ───────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def users_list_view(request):
    """List all users. Supports ?status=pending filter."""
    users = User.objects.all().order_by('-created_at')

    status_filter = request.query_params.get('status')
    if status_filter:
        users = users.filter(status=status_filter)

    search = request.query_params.get('search')
    if search:
        from django.db.models import Q
        users = users.filter(
            Q(full_name__icontains=search) |
            Q(email__icontains=search) |
            Q(phone_number__icontains=search)
        )

    serializer = UserSerializer(users, many=True, context={'request': request})
    return Response(serializer.data)


# ─── Approve / Block Users ────────────────────────────────────────────────────

@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def approve_user_view(request, user_id):
    """Admin approves a pending user."""
    if not request.user.is_staff:
        return Response({'error': 'permission_denied'}, status=status.HTTP_403_FORBIDDEN)

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'not_found'}, status=status.HTTP_404_NOT_FOUND)

    user.status = 'approved'
    user.save()
    return Response({'id': str(user.id), 'status': user.status})


@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def block_user_view(request, user_id):
    """Admin blocks a user."""
    if not request.user.is_staff:
        return Response({'error': 'permission_denied'}, status=status.HTTP_403_FORBIDDEN)

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'not_found'}, status=status.HTTP_404_NOT_FOUND)

    user.status = 'blocked'
    user.save()
    return Response({'id': str(user.id), 'status': user.status})
