from .models import Activity


def log_activity(
    *,
    user,
    activity_type,
    action,
    title,
    description='',
    object_id=None,
    object_name='',
):
    return Activity.objects.create(
        user=user,
        activity_type=activity_type,
        action=action,
        title=title,
        description=description,
        object_id=object_id,
        object_name=object_name,
    )