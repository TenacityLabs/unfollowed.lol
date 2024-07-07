from django.urls import path

from .views import getData, receiveData, userProfile, getRecentTransactions, getAllTransactions

urlpatterns = [
    path('', getData),
    path('receive', receiveData),
    path('user/<str:username>/', userProfile),
    path('transactions/<str:username>/', getRecentTransactions),
    path('transactions/<str:username>/all/', getAllTransactions),

]
