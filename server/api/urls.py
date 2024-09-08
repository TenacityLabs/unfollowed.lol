from django.urls import path

from .views import getData, receiveData, userProfile

urlpatterns = [
    path('', getData),
    path('receive', receiveData),
    path('user/<str:username>/', userProfile),
]
