FROM python:3.6-alpine3.6

ENV ROUTER_URL http://0.0.0.0:5000

COPY requirements.txt .

RUN pip install -r requirements.txt

COPY gunicorn_config.py .

COPY source /app

EXPOSE 7000

CMD ["gunicorn", "--chdir", "app", "--config", "./gunicorn_config.py", "app:app"]
