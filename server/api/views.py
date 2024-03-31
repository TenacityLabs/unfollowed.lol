from rest_framework.decorators import api_view
from rest_framework.response import Response
from server.serializers import UserSerializer
from server.models import User
from django.http import JsonResponse
import json
from django.db import transaction


@api_view(['GET'])
def getData(request):
    person = {'name':'Edison', 'age': 18}
    return Response(person)

@api_view(['POST'])
def receiveData(request):
    data = json.loads(request.body)
    username = data.get('username')
    insta_name = data.get('insta_name')
    user, created = User.objects.get_or_create(username=username)

    with transaction.atomic():
        for field in ['followers', 'followings', 'unfollowers', 'fans']:
            related_users_data = data.get(field, [])

            if field == 'followers':
                user.followers = related_users_data
            elif field == 'followings':
                user.following = related_users_data
            elif field == 'unfollowers':
                user.unfollowers = related_users_data
            elif field == 'fans':
                user.fans = related_users_data

        user.isProcessed = True
        user.save()

    return JsonResponse({'status': 'success'})

@api_view(['GET'])
def userProfile(request, username):

    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

    return JsonResponse({
        'username': user.username,
        'insta_name': user.insta_name,
        'followers': user.followers,
        'following': user.following,
        'fans': user.fans,
        'unfollowers': user.unfollowers,
    })
