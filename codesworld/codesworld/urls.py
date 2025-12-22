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
from coder2d.views import *


#
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

ciphers_paths = cesar_paths + subs_paths + aes_paths
#

code128_paths = [
    path('2D/base128', base128, name='base128'),
    path('2D/api/base128encode', base128_encode, name='base128_encode')
]

qr_paths = [
    path('2D/qr', qr, name='qr'),
    path('2D/api/qrencode', qr_encode, name='qr_encode')
]

datamatrix_paths = [
    path('2D/datamatrix', datamatrix, name='datamatrix'),
    path('2D/api/datamatrixencode', datamatrix_encode, name='datamatrix_encode')
]



paths_2d = code128_paths + qr_paths + datamatrix_paths


urlpatterns = [
    path('admin/', admin.site.urls),
    path('ciphers/', ciphermain, name='ciphermain'),
] + ciphers_paths + paths_2d
