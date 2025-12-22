from django.urls import path
from .views import (
    get_todos,
    CustomTokenObtainPairView,
    CustomTokenRefreshView,
    logout,
    register,
    is_logged_in
)

urlpatterns = [
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('logout/', logout, name='logout'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('todos/', get_todos, name='todos'),
    path('register/', register, name='register'),
    path('authenticated/', is_logged_in, name='authenticated'),
]
