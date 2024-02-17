from rest_framework.decorators import api_view
from rest_framework.response import Response
from server.serializers import UserSerializer

@api_view(['GET'])
def getData(request):
    person = {'name':'Edison', 'age': 18}
    return Response(person)

@api_view(['POST'])
def receiveData(request):

    followers_data = request.data.get('followers', [])
    followings_data = request.data.get('followings', [])
    unfollowers = request.data.get('dontFollowMeBack', [])


    for user_data in unfollowers:
        serializer = UserSerializer(data=user_data)
        if serializer.is_valid():
            serializer.save()

    return Response({"status": "success"})

