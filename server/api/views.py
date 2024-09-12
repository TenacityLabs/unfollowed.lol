import datetime

from rest_framework.decorators import api_view
from rest_framework.response import Response
from server.models import User
from django.http import JsonResponse
import json
from django.db import transaction
import humanize
from django.utils import timezone


@api_view(['GET'])
def getData(request):
    person = {'name':'Edison', 'age': 18}
    return Response(person)

@api_view(['POST'])
def receiveData(request):
    if not request.body:
        return JsonResponse({'error': 'Empty request body'}, status=400)
    
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError as e:
        return JsonResponse({'error': f'Invalid JSON: {str(e)}'}, status=400)
    
    username = data.get('username').strip()
    insta_name = data.get('insta_name')
    avatar_url = data.get('avatar_url')
    new = False
    
    print(f'Received from user {username}, {insta_name}')

    if not username:
        return JsonResponse({'error': 'Username is required'}, status=400)
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        new = True
        user = User.objects.create()

    with transaction.atomic():
        user_data = {field: data.get(field, []) for field in ['followers', 'followings', 'unfollowers', 'fans']}
        followers = user_data['followers']
        following = user_data['followings']
        unfollowers = user_data['unfollowers']
        fans = user_data['fans']

        print(f'Processing {username}, {insta_name} with {len(followers)} followers and {len(following)} followings')


    if user.username:
        old_followers = [(follower['username'], follower['insta_name'], follower['avatar_url']) for follower in user.followers]
        old_usernames = {tup[0] for tup in old_followers}
        current_followers = [(follower['username'], follower['insta_name'], follower['avatar_url']) for follower in followers]
        current_usernames = {tup[0] for tup in current_followers}

        # Fix: Create dictionaries for easy lookup
        old_followers_dict = {f[0]: f for f in old_followers}
        current_followers_dict = {f[0]: f for f in current_followers}

        # Fix: Use the dictionaries to create unfollows and follows
        unfollows = [old_followers_dict[username] for username in (old_usernames - current_usernames)]
        follows = [current_followers_dict[username] for username in (current_usernames - old_usernames)]
        
        # for follower in (old_usernames - current_usernames):
        #     follower_tuple = next(tup for tup in old_followers if tup[0] == follower)
        #     Transaction.objects.create(from_user = {'username': follower, 'insta_name': follower_tuple[1], 'avatar_url': follower_tuple[2]}, to_user = user, action = 'Unfollowed').save()

        # for follower in (current_usernames - old_usernames):
        #     follower_tuple = next(tup for tup in current_followers if tup[0] == follower)
        #     Transaction.objects.create(from_user = {'username': follower, 'insta_name': follower_tuple[1], 'avatar_url': follower_tuple[2]}, to_user = user, action = 'Followed').save()

    user.username = username
    user.insta_name = insta_name
    user.avatar_url = avatar_url

    user.followers, user.following, user.unfollowers, user.fans = followers, following, unfollowers, fans
    if not new:
        user.recent_follows, user.recent_unfollows = follows, unfollows
        user.follows = follows + user.follows
        user.unfollows = unfollows + user.unfollows

    user.save()

    return JsonResponse({'status': 'success'})

@api_view(['GET'])
def userProfile(request, username):

    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    
    response = {
        'general': {
            'username': user.username,  # Instagram username
            'insta_name': user.insta_name, # Instagram "Full Name"
            'avatar_url': user.avatar_url, # Profile picture URL
            'last_updated': user.last_updated, # Last updated time
            'follower_count': len(user.followers), # Number of followers
            'following_count': len(user.following), # Number of following
            'fan_count': len(user.fans), # Number of fans
            'unfollower_count': len(user.unfollowers), # Number of unfollowers
        },
        'transactions': {
            'recent_follows': user.recent_follows,
            'recent_unfollows': user.recent_unfollows,
            'all_follows': user.follows,
            'all_unfollows': user.unfollows,
        },
        'followers': user.followers, # List of followers
        'following': user.following, # List of following
        'fans': user.fans, # List of fans
        'unfollowers': user.unfollowers # List of unfollowers
    }
    return JsonResponse(response)

# @api_view(['GET'])
# def getRecentTransactions(request, username):
#     try:
#         user = User.objects.get(username=username)
#     except User.DoesNotExist:
#         return JsonResponse({'error': 'User not found'}, status=404)

#     day_ago = datetime.datetime.now() - datetime.timedelta(days=1)
#     week_ago = datetime.datetime.now() - datetime.timedelta(weeks=1)
#     last_day = Transaction.objects.filter(to_user=user, timestamp__gte=day_ago).order_by('-timestamp')
#     last_week = (Transaction.objects.filter(to_user=user, timestamp__gte=week_ago)).difference(last_day).order_by('-timestamp')

#     return JsonResponse({
#         'today': TransactionSerializer(last_day[:3], many=True).data,
#         'total_today': last_day.count(),
#         'this_week': TransactionSerializer(last_week[:3], many=True).data,
#         'total_this_week': last_week.count()
#     })

# @api_view(['GET'])
# def getAllTransactions(request, username):
    
#     # Get user from database
#     try:
#         user = User.objects.get(username=username)
#     except User.DoesNotExist:
#         return JsonResponse({'error': 'User not found'}, status=404)
    
#     # Get number of transactions to return, default to 0 if not provided or invalid
#     number = request.GET.get('number', default=0)
#     try:
#         number = int(number)
#         if number <= 0:
#             raise ValueError("Number must be positive")
#     except ValueError:
#         number = 0

#     day_ago = datetime.datetime.now() - datetime.timedelta(days=1)
#     week_ago = datetime.datetime.now() - datetime.timedelta(weeks=1)
#     month_ago = datetime.datetime.now() - datetime.timedelta(days=30)

#     transactions_last_day = Transaction.objects.filter(to_user=user, timestamp__gte=day_ago)
#     transactions_last_week = Transaction.objects.filter(to_user=user, timestamp__gte=week_ago)
#     transactions_last_month = Transaction.objects.filter(to_user=user, timestamp__gte=month_ago)
#     transactions_all = Transaction.objects.filter(to_user=user).order_by('-timestamp')

#     response = {
#         'last_day': {
#             'followed': len(transactions_last_day.filter(action='Followed')),
#             'unfollowed': len(transactions_last_day.filter(action='Unfollowed')),
#             'total': len(transactions_last_day)
#         },
#         'last_week': {
#             'followed': len(transactions_last_week.filter(action='Followed')),
#             'unfollowed': len(transactions_last_week.filter(action='Unfollowed')),
#             'total': len(transactions_last_week)
#         },
#         'last_month': {
#             'followed': len(transactions_last_month.filter(action='Followed')),
#             'unfollowed': len(transactions_last_month.filter(action='Unfollowed')),
#             'total': len(transactions_last_month)
#         },
#         'total': {
#             'followed': len(transactions_all.filter(action='Followed')),
#             'unfollowed': len(transactions_all.filter(action='Unfollowed')),
#             'total': len(transactions_all)
#         }
#     }

#     if number > 0:
#         response['transactions'] = TransactionSerializer(transactions_all[:number], many=True).data

#     return JsonResponse(response)
