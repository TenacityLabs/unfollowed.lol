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
    data = {
        'username': user.username,
        'insta_name': user.insta_name,
    }    
    
    relationships = ['followers', 'following', 'fans', 'unfollowers'] 
    data.update({rel: list(getattr(user, rel).all().values_list('username', flat=True)) for rel in relationships})
    
    return Response(data)