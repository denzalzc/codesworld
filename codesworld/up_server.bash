cp nginx.art /etc/nginx/sites-available
nginx -t
.././venv/bin/python3 manage.py collectstatic
DJANGO_DEBUG=False
.././venv/bin/python3 .././venv/bin/gunicorn --bind 127.0.0.1 codesworld.wsgi:application