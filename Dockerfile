FROM python:3.6-alpine3.6

ENV GUNICORN_N_WORKERS 9
ENV GUNICORN_W_TIMEOUT 60

ADD athena_ui /app/athena_ui
ADD requirements.txt /app

WORKDIR /app

RUN pip install -r requirements.txt

EXPOSE 5000

CMD gunicorn --workers $GUNICORN_N_WORKERS -t $GUNICORN_W_TIMEOUT --bind 0.0.0.0:5000 athena_ui.api:app