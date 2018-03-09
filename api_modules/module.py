import requests
import json
import os


def request_router(path):
    router_url = os.getenv("ROUTER_URL")
    r = requests.get(router_url + path).json()
    print(r)
    return json.dumps(r)


def request_xlsx(path):
    router_url = os.getenv("ROUTER_URL")
    r = requests.get(router_url + path).json()
    return r
