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


@api_view(['POST'])
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
        
        # We need to get the user from the serializer *after* validation
        serializer = self.get_serializer(data=request.data)
        
        try:
            serializer.is_valid(raise_exception=True)
        except Exception:
            return Response({'success': False, 'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # FIX: Get the user from the validated serializer
        user = serializer.user
        user_data = UserSerializer(user).data # (Fixed typo 'seriliazer')
        
        tokens = serializer.validated_data
        access_token = tokens['access']
        refresh_token = tokens['refresh']

        res = Response()
        
        # Set HttpOnly cookies
        res.set_cookie(
            key='access_token',
            value=str(access_token),
            httponly=True,
            # FIX: Must be False for local http development
            secure=False,
            # FIX: 'Lax' is correct for local dev. 'None' requires secure=True
            samesite='Lax', 
            path='/'
        )

        res.set_cookie(
            key='refresh_token',
            value=str(refresh_token),
            httponly=True,
            # FIX: Must be False for local http development
            secure=False, 
            # FIX: 'Lax' is correct
            samesite='Lax',
            path='/'
        )
        
        # Return user data and tokens in the response body (optional)
        res.data = {
            'success': True,
            'user': user_data,
            'access': access_token,
            'refresh': refresh_token
        }
        res.status_code = status.HTTP_200_OK
        return res
        
        
class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        try:
            refresh_token = request.COOKIES.get('refresh_token')

            if not refresh_token:
                return Response({'refreshed': False, 'message': 'Refresh token not found in cookie'}, status=status.HTTP_400_BAD_REQUEST)

            request.data['refresh'] = refresh_token

            response = super().post(request, *args, **kwargs)
            
            tokens = response.data
            access_token = tokens['access']

            res = Response()
            res.data = {'refreshed': True}

            res.set_cookie(
                key='access_token',
                value=access_token,
                httponly=True,
                # FIX: Must be False for local http
                secure=False, 
                # FIX: Must be 'Lax'
                samesite='Lax', 
                path='/'
            )
            
            # If you have ROTATE_REFRESH_TOKENS = True in settings.py,
            # you MUST also set the new refresh token cookie here.
            # if 'refresh' in tokens:
            #     res.set_cookie(
            #         key='refresh_token',
            #         value=tokens['refresh'],
            #         httponly=True,
            #         secure=False,
            #         samesite='Lax',
            #         path='/'
            #     )
                
            return res

        except Exception as e:
            return Response({'refreshed': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    try:
        # FIX: Get the refresh token from the cookie
        refresh_token = request.COOKIES.get('refresh_token')
        
        if refresh_token:
            # FIX: Blacklist the token
            token = RefreshToken(refresh_token)
            token.blacklist()
        
        res = Response()
        res.data = {'success': True, 'message': 'Logged out successfully'}

        # FIX: 'samesite' must match what was set (Lax)
        res.delete_cookie('access_token', path='/', samesite='Lax')
        # FIX: Corrected typo 'response_token' -> 'refresh_token'
        res.delete_cookie('refresh_token', path='/', samesite='Lax')

        res.status_code = status.HTTP_200_OK
        return res

    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


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