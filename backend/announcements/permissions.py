from rest_framework.permissions import BasePermission


class IsAdminOrOfficer(BasePermission):
    message = (
        'Only ICT Centre officers or administrators '
        'can manage announcements.'
    )

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in ['officer', 'admin']
        )