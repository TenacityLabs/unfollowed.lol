from django.urls import path

from .views import getData, receiveData

urlpatterns = [
    path('', getData),
    path('receive',receiveData )

]
