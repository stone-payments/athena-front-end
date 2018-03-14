import requests
import json
import os


def request_router(path):
    router_url = os.getenv("ROUTER_URL")
    r = requests.get(router_url + path).json()
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
