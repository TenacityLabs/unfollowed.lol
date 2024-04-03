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

<<<<<<< HEAD
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
                
    user.isProcessed = True
    user.save()

    return Response({'status': 'success'})
=======
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
>>>>>>> 61d5ed5c2d122c0b9aebc56d2ba73f3e7398c3a3

@api_view(['GET'])
def userProfile(request, username):

    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

    return JsonResponse(UserProfileSerializer(user).data)

@api_view(['GET'])
def getRecentTransactions(request, username):
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

    day_ago = datetime.datetime.now() - datetime.timedelta(days=1)
    week_ago = datetime.datetime.now() - datetime.timedelta(weeks=1)
    last_day = Transaction.objects.filter(to_user=user, timestamp__gte=day_ago).order_by('-timestamp')
    last_week = (Transaction.objects.filter(to_user=user, timestamp__gte=week_ago)).difference(last_day).order_by('-timestamp')

    return JsonResponse({
        'today': TransactionSerializer(last_day[:3], many=True).data,
        'total_today': last_day.count(),
        'this_week': TransactionSerializer(last_week[:3], many=True).data,
        'total_this_week': last_week.count() # doesn't include today (last 24 hrs)
    })

@api_view(['GET'])
def getAllTransactions(request, username):
    
    # Get user from database
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    
    # Get number of transactions to return, default to 0 if not provided or invalid
    number = request.GET.get('number', default=0)
    try:
        number = int(number)
        if number <= 0:
            raise ValueError("Number must be positive")
    except ValueError:
        number = 0

    day_ago = datetime.datetime.now() - datetime.timedelta(days=1)
    week_ago = datetime.datetime.now() - datetime.timedelta(weeks=1)
    month_ago = datetime.datetime.now() - datetime.timedelta(days=30)

    transactions_last_day = Transaction.objects.filter(to_user=user, timestamp__gte=day_ago)
    transactions_last_week = Transaction.objects.filter(to_user=user, timestamp__gte=week_ago)
    transactions_last_month = Transaction.objects.filter(to_user=user, timestamp__gte=month_ago)
    transactions_all = Transaction.objects.filter(to_user=user).order_by('-timestamp')

    response = {
        'last_day': {
            'followed': len(transactions_last_day.filter(action='Followed')),
            'unfollowed': len(transactions_last_day.filter(action='Unfollowed')),
            'total': len(transactions_last_day)
        },
        'last_week': {
            'followed': len(transactions_last_week.filter(action='Followed')),
            'unfollowed': len(transactions_last_week.filter(action='Unfollowed')),
            'total': len(transactions_last_week)
        },
        'last_month': {
            'followed': len(transactions_last_month.filter(action='Followed')),
            'unfollowed': len(transactions_last_month.filter(action='Unfollowed')),
            'total': len(transactions_last_month)
        },
        'total': {
            'followed': len(transactions_all.filter(action='Followed')),
            'unfollowed': len(transactions_all.filter(action='Unfollowed')),
            'total': len(transactions_all)
        }
    }

    if number > 0:
        response['transactions'] = TransactionSerializer(transactions_all[:number], many=True).data

    return JsonResponse(response)
