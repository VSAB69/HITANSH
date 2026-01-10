from django.conf import settings
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Todo
from .serializers import (
    TodoSerializer,
    UserRegisterSerializer,
    UserSerializer,
)

# ─────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────

def is_secure_cookie():
    """
    Secure cookies only in production (HTTPS)
    """
    return not settings.DEBUG


def get_cookie_domain():
    """
    Required for cross-subdomain auth (Pages → Render)
    """
    if settings.DEBUG:
        return None  # localhost
    return ".onrender.com"


def get_cookie_kwargs():
    return {
        "httponly": True,
        "secure": is_secure_cookie(),
        "samesite": "None" if is_secure_cookie() else "Lax",
        "path": "/",
        "domain": get_cookie_domain(),
    }


# ─────────────────────────────────────────────
# AUTH
# ─────────────────────────────────────────────

@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
def register(request):
    serializer = UserRegisterSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Login → sets JWT in HttpOnly cookies
    """

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except Exception:
            return Response(
                {"success": False, "message": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        user = serializer.user
        tokens = serializer.validated_data

        access_token = tokens["access"]
        refresh_token = tokens["refresh"]

        res = Response(
            {
                "success": True,
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )

        cookie_kwargs = get_cookie_kwargs()

        res.set_cookie("access_token", str(access_token), **cookie_kwargs)
        res.set_cookie("refresh_token", str(refresh_token), **cookie_kwargs)

        return res


class CustomTokenRefreshView(TokenRefreshView):
    """
    Refresh access token using refresh cookie
    """

    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get("refresh_token")

        if not refresh_token:
            return Response(
                {"refreshed": False, "message": "No refresh token"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        request.data["refresh"] = refresh_token
        response = super().post(request, *args, **kwargs)

        access = response.data.get("access")
        new_refresh = response.data.get("refresh")

        res = Response({"refreshed": True})

        cookie_kwargs = get_cookie_kwargs()

        res.set_cookie("access_token", access, **cookie_kwargs)

        # If ROTATE_REFRESH_TOKENS = True
        if new_refresh:
            res.set_cookie("refresh_token", new_refresh, **cookie_kwargs)

        return res


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout(request):
    """
    Logout → blacklist refresh token & clear cookies
    """
    refresh_token = request.COOKIES.get("refresh_token")

    if refresh_token:
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            pass

    res = Response({"success": True})

    res.delete_cookie(
        "access_token",
        path="/",
        domain=get_cookie_domain(),
        samesite="None" if is_secure_cookie() else "Lax",
    )

    res.delete_cookie(
        "refresh_token",
        path="/",
        domain=get_cookie_domain(),
        samesite="None" if is_secure_cookie() else "Lax",
    )

    return res


# ─────────────────────────────────────────────
# PROTECTED TEST ENDPOINTS
# ─────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_todos(request):
    todos = Todo.objects.filter(owner=request.user)
    return Response(TodoSerializer(todos, many=True).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def is_logged_in(request):
    return Response(UserSerializer(request.user).data)
