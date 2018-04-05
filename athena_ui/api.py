import io
from flask import Flask, render_template, request, send_file
import xlsxwriter
import json

from athena_ui.module import request_router, json_to_excel


app = Flask(__name__)


@app.route('/')
@app.route('/orgs')
@app.route('/index')
def index():
    return render_template('orgs.html')


@app.route('/repos')
def repos():
    org_name = request.args.get('org', default="None")
    repository_name = request.args.get('name', default="None")
    repo = {'name': repository_name}
    org = {'name': org_name}
    return render_template('repos.html', repo=repo, org=org)


@app.route('/teams')
def teams():
    org_name = request.args.get('org', default="None")
    team = request.args.get('name', default="None")
    team = {'name': team}
    org = {'name': org_name}
    return render_template('teams.html', team=team, org=org)


@app.route('/user')
def users():
    user_name = request.args.get('name', default="None")
    user = {'username': user_name}
    return render_template('user.html', user=user)


@app.route('/tv')
def tv():
    return render_template('tv.html')


@app.route('/proxy/<path:path>')
def proxy(path):
    return request_router(f"/{path}?{request.query_string.decode('utf-8')}")


@app.route('/report_consolidate_readme')
def get_report_consolidate_readme():
    query_result = request_router(request.full_path)
    output = io.BytesIO()
    data = json.loads(query_result)
    wb = xlsxwriter.Workbook(output)
    ws = wb.add_worksheet()
    json_to_excel(ws, data)
    wb.close()
    output.seek(0)
    return send_file(output, attachment_filename="{}".format("report_consolidate_readme.xlsx"), as_attachment=True)


@app.route('/report_readme')
def get_report_readme():
    query_result = request_router(request.full_path)
    output = io.BytesIO()
    data = json.loads(query_result)
    wb = xlsxwriter.Workbook(output)
    ws = wb.add_worksheet()
    json_to_excel(ws, data)
    wb.close()
    output.seek(0)
    return send_file(output, attachment_filename="{}".format("report_readme.xlsx"), as_attachment=True)


@app.route('/report_team_repository_info')
def report_team_repository_info():
    query_result = request_router(request.full_path)
    output = io.BytesIO()
    data = json.loads(query_result)
    wb = xlsxwriter.Workbook(output)
    ws = wb.add_worksheet()
    json_to_excel(ws, data)
    wb.close()
    output.seek(0)
    return send_file(output, attachment_filename="{}".format("report_team_repository_info.xlsx"), as_attachment=True)
