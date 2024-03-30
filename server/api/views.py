from rest_framework.decorators import api_view
from rest_framework.response import Response
from server.serializers import UserSerializer
from server.models import User
from django.http import JsonResponse
import json


@api_view(['GET'])
def getData(request):
    person = {'name':'Edison', 'age': 18}
    return Response(person)

@api_view(['POST'])
def receiveData(request):
    data = json.loads(request.body)
    print(data)
    username = data.get('username')
    user, created = User.objects.get_or_create(username=username)

    for field in ['followers', 'followings', 'unfollowers', 'fans']:
        related_users = data.get(field, [])
        for related_user_data in related_users:
            related_user, _ = User.objects.get_or_create(
                username=related_user_data['username'],
                defaults={'insta_name': related_user_data.get('insta_name', '')}
            )
            
            if field == 'followers':
                user.followers.add(related_user)
            elif field == 'followings':
                user.following.add(related_user)
            elif field == 'unfollowers':
                user.unfollowers.add(related_user)
            elif field == 'fans':
                user.fans.add(related_user)
                
    return Response({'status': 'success'})

@api_view(['GET'])
def userProfile(request, username):
    user = User.objects.get(username=username)
    followers = list(user.followers.all().values('username', 'insta_name'))
    following = list(user.following.all().values('username', 'insta_name'))
    fans = list(user.fans.all().values('username', 'insta_name'))
    unfollowers = list(user.unfollowers.all().values('username', 'insta_name'))

    return Response({
        'username': user.username,
        'insta_name': user.insta_name,
        'followers': followers,
        'following': following,
        'fans': fans,
        'unfollowers': unfollowers,
    })
