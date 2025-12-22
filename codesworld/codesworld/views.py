from django.shortcuts import render

def index(request):
    return render(request, 'index.html')












def snake(request):
    return render(request, 'snake.html')
