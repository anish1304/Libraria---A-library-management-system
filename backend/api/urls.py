from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AdminLoginView, StudentLoginView, MeView, LogoutView,
    LibraryViewSet, BookViewSet, StudentViewSet, LoanViewSet,
    DashboardStatsView, MyLoansView,
)

router = DefaultRouter()
router.register(r'libraries', LibraryViewSet, basename='library')
router.register(r'books', BookViewSet, basename='book')
router.register(r'students', StudentViewSet, basename='student')
router.register(r'loans', LoanViewSet, basename='loan')

urlpatterns = [
    # Auth
    path('auth/admin-login/', AdminLoginView.as_view(), name='admin-login'),
    path('auth/student-login/', StudentLoginView.as_view(), name='student-login'),
    path('auth/me/', MeView.as_view(), name='me'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    # Dashboard
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    # Student self-loans
    path('my-loans/', MyLoansView.as_view(), name='my-loans'),
    # Router-registered endpoints
    path('', include(router.urls)),
]
