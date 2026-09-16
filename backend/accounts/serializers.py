from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password

from rest_framework import serializers

from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={'input_type': 'password'},
    )

    password_confirm = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'},
    )

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'email',
            'password',
            'password_confirm',
            'phone',
            'student_id',
            'course',
            'year_of_study',
            'role',
        ]
        read_only_fields = [
            'id',
            'role',
        ]

    def validate_email(self, value):
        return value.lower().strip()

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'Passwords do not match.',
            })

        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')

        password = validated_data.pop('password')

        user = User(**validated_data)
        user.set_password(password)
        user.save()

        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()

    password = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'},
    )

    def validate(self, attrs):
        email = attrs.get(
            'email',
            '',
        ).lower().strip()

        password = attrs.get('password')

        user = authenticate(
            username=email,
            password=password,
        )

        if not user:
            raise serializers.ValidationError(
                'Invalid email or password.'
            )

        if not user.is_active:
            raise serializers.ValidationError(
                'This account is inactive.'
            )

        attrs['user'] = user

        return attrs


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'email',
            'phone',
            'student_id',
            'course',
            'year_of_study',
            'role',
        ]
        read_only_fields = [
            'id',
            'username',
            'email',
            'role',
        ]


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'email',
            'phone',
            'student_id',
            'course',
            'year_of_study',
            'role',
            'is_active',
            'date_joined',
            'last_login',
        ]
        read_only_fields = [
            'id',
            'username',
            'email',
            'date_joined',
            'last_login',
        ]

    def validate_email(self, value):
        return value.lower().strip()


class AdminCreateUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={'input_type': 'password'},
    )

    password_confirm = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'},
    )

    class Meta:
        model = User
        fields = [
            'id',
            'first_name',
            'last_name',
            'email',
            'password',
            'password_confirm',
            'phone',
            'student_id',
            'course',
            'year_of_study',
            'role',
            'is_active',
        ]
        read_only_fields = [
            'id',
        ]

    def validate_email(self, value):
        return value.lower().strip()

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'Passwords do not match.',
            })

        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')

        password = validated_data.pop('password')

        user = User(**validated_data)
        user.set_password(password)
        user.save()

        return user


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'},
    )

    new_password = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'},
    )

    new_password_confirm = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'},
    )

    def validate_current_password(self, value):
        user = self.context['request'].user

        if not user.check_password(value):
            raise serializers.ValidationError(
                'Your current password is incorrect.'
            )

        return value

    def validate(self, attrs):
        new_password = attrs.get('new_password')

        new_password_confirm = attrs.get(
            'new_password_confirm'
        )

        if new_password != new_password_confirm:
            raise serializers.ValidationError({
                'new_password_confirm': (
                    'New passwords do not match.'
                ),
            })

        user = self.context['request'].user

        try:
            validate_password(
                new_password,
                user=user,
            )

        except serializers.ValidationError:
            raise

        except Exception as exc:
            raise serializers.ValidationError({
                'new_password': str(exc),
            })

        if user.check_password(new_password):
            raise serializers.ValidationError({
                'new_password': (
                    'Your new password must be different '
                    'from your current password.'
                ),
            })

        return attrs