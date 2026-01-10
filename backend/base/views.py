#
# Your imports
#
from django.conf import settings
from .models import User


from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status  # <-- Import status

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from rest_framework_simplejwt.tokens import RefreshToken # <-- Import RefreshToken for logout

from .models import Todo
from .serializers import TodoSerializer, UserRegisterSerializer, UserSerializer

from datetime import datetime, timedelta

from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny


def is_secure_cookie():
    return not settings.DEBUG



@api_view(['POST'])
@authentication_classes([]) 
@permission_classes([AllowAny])
def register(request):
    serializer = UserRegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED) # <-- Return 201
    
    # FIX: Use .errors (plural) and return a 400 status
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except Exception:
            return Response(
                {'success': False, 'message': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        user = serializer.user
        user_data = UserSerializer(user).data

        tokens = serializer.validated_data
        access_token = tokens['access']
        refresh_token = tokens['refresh']

        res = Response(
            {'success': True, 'user': user_data},
            status=status.HTTP_200_OK
        )

        cookie_kwargs = {
            "httponly": True,
            "secure": is_secure_cookie(),
            "samesite": "None" if is_secure_cookie() else "Lax",
            "path": "/",
        }

        res.set_cookie("access_token", str(access_token), **cookie_kwargs)
        res.set_cookie("refresh_token", str(refresh_token), **cookie_kwargs)

        return res

        
class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get("refresh_token")

        if not refresh_token:
            return Response(
                {"refreshed": False, "message": "No refresh token"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        request.data["refresh"] = refresh_token
        response = super().post(request, *args, **kwargs)

        access = response.data.get("access")
        new_refresh = response.data.get("refresh")

        res = Response({"refreshed": True})

        cookie_kwargs = {
            "httponly": True,
            "secure": is_secure_cookie(),
            "samesite": "None" if is_secure_cookie() else "Lax",
            "path": "/",
        }

        res.set_cookie("access_token", access, **cookie_kwargs)

        if new_refresh:
            res.set_cookie("refresh_token", new_refresh, **cookie_kwargs)

        return res

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout(request):
    refresh_token = request.COOKIES.get("refresh_token")

    if refresh_token:
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            pass

    res = Response({"success": True})

    cookie_kwargs = {
        "path": "/",
        "secure": is_secure_cookie(),
        "samesite": "None" if is_secure_cookie() else "Lax",
    }

    res.delete_cookie("access_token", **cookie_kwargs)
    res.delete_cookie("refresh_token", **cookie_kwargs)

    return res


#
# Your other views (get_todos, is_logged_in) look fine
#
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_todos(request):
    user = request.user
    todos = Todo.objects.filter(owner=user)
    serializer = TodoSerializer(todos, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def is_logged_in(request):
    serializer = UserSerializer(request.user, many=False)
    return Response(serializer.data)