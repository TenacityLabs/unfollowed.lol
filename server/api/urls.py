from django.urls import path

from .views import getData, receiveData, userProfile, getRecentTransactions, getAllTransactions, serve_verification_file

urlpatterns = [
    path('', getData),
    path('receive', receiveData),
    path('user/<str:username>/', userProfile),
    path('transactions/<str:username>/', getRecentTransactions),
    path('transactions/<str:username>/all/', getAllTransactions),
    path('.well-known/pki-validation/B45539896C49210367274D3AD1C60BD5.txt', serve_verification_file),

]
