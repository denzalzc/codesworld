"""
URL configuration for codesworld project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from chipers.views import *


cesar_paths = [
    path('ciphers/cesar/', cesar, name='cesar'),
    path('ciphers/api/cesarencode', cesar_encode, name='cesar_encode'),
    path('ciphers/api/cesardecode', cesar_decode, name='cesar_decode'),
]

subs_paths = [
    path('ciphers/subs/', subs, name='subs'),
    path('ciphers/api/subsencode', subs_encode, name='subs_encode'),
    path('ciphers/api/subsdecode', subs_decode, name='subs_decode'),
]

aes_paths = [
    path('ciphers/aes/', aes, name='aes'),
    path('ciphers/api/aesencode', aes_encode, name='aes_encode'),
    path('ciphers/api/aesdecode', aes_decode, name='aes_decode'),
]


urlpatterns = [
    path('admin/', admin.site.urls),
    path('ciphers/', ciphermain, name='ciphermain'),
] + cesar_paths + subs_paths + aes_paths
