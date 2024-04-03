import datetime
from rest_framework.decorators import api_view
from rest_framework.response import Response
from server.serializers import TransactionSerializer, UserProfileSerializer, UserSerializer
from server.models import User, Transaction
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
        user_data = {field: data.get(field, []) for field in ['followers', 'followings', 'unfollowers', 'fans']}
        followers = user_data['followers']
        following = user_data['followings']
        unfollowers = user_data['unfollowers']
        fans = user_data['fans']

    if user.isProcessed:
        # Check for changes in followers
        old_followers = [(follower['username'], follower['insta_name']) for follower in user.followers]
        old_usernames = {tup[0] for tup in old_followers}
        current_followers = [(follower['username'], follower['insta_name']) for follower in followers]
        current_usernames = {tup[0] for tup in current_followers}

        for follower in (old_usernames - current_usernames):
            follower_name = next(value for key, value in old_followers if key == follower)
            Transaction.objects.create(from_user = {'username': follower, 'insta_name': follower_name}, to_user = user, action = 'Unfollowed').save()

        for follower in (current_usernames - old_usernames):
            follower_name = next(value for key, value in current_followers if key == follower)
            Transaction.objects.create(from_user = {'username': follower, 'insta_name': follower_name}, to_user = user, action = 'Followed').save()

    elif not user.isProcessed:
        user.isProcessed = True

    user.followers, user.following, user.unfollowers, user.fans = followers, following, unfollowers, fans
    user.save()

    return JsonResponse({'status': 'success'})

@api_view(['GET'])
def userProfile(request, username):

    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

    return JsonResponse(UserProfileSerializer(user).data)

@api_view(['GET'])
def getTransactions(request, username):
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

    day_ago = datetime.datetime.now() - datetime.timedelta(days=1)
    week_ago = datetime.datetime.now() - datetime.timedelta(weeks=1)
    last_day = Transaction.objects.filter(to_user=user, timestamp__gte=day_ago)
    last_week = (Transaction.objects.filter(to_user=user, timestamp__gte=week_ago)).difference(last_day)

    return JsonResponse({
        'today': TransactionSerializer(last_day[:3], many=True).data,
        'total_today': last_day.count(),
        'this_week': TransactionSerializer(last_week[:3], many=True).data,
        'total_this_week': last_week.count()
    })