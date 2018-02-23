import requests
import json
import os


def request_router(path):
    router_url = os.getenv("ROUTER_URL")
    r = requests.get(router_url + path).json()
    return json.dumps(r)
