from rest_framework.permissions import BasePermission


class IsAdminStaff(BasePermission):
    """Allow only staff or superuser accounts."""
    message = 'Admin access required.'

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.is_staff or request.user.is_superuser)
        )


class IsStudentOnly(BasePermission):
    """Allow only authenticated users who are not staff."""
    message = 'Student access only.'

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            not request.user.is_staff and
            not request.user.is_superuser and
            hasattr(request.user, 'student_profile')
        )
