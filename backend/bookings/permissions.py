from rest_framework.permissions import BasePermission


class IsOfficer(BasePermission):
    """
    Allows access only to authenticated ICT Centre officers.
    """

    message = 'Only ICT Centre officers can perform this action.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'officer'
        )


class IsAdminOrOfficer(BasePermission):
    """
    Allows access to ICT Centre officers and administrators.
    """

    message = (
        'Only ICT Centre officers or administrators '
        'can perform this action.'
    )

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in ['officer', 'admin']
        )