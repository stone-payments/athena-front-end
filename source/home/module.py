import json
import os

import requests

ROUTER_URL = os.getenv("ROUTER_URL")


def request_router(path):
    r = requests.get(ROUTER_URL + path).json()
    return json.dumps(r)


def json_to_excel(ws, data, row=0):
    for item in data:
        col = 0
        for key, value in item.items():
            if row == 0:
                ws.write(row, col, key)
            else:
                if type(value) != str:
                    value = str(value)
                ws.write(row, col, value)
            col += 1
        row += 1
