from django.urls import path

from .views import getData, getTransactions, receiveData, userProfile

urlpatterns = [
    path('', getData),
    path('receive', receiveData),
    path('user/<str:username>/', userProfile),
    path('transactions/<str:username>/', getTransactions)
]
