import io
from flask import Flask, render_template, request, send_file
from api_modules.module import request_router, json_to_excel
import xlsxwriter
import json


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


# Org
@app.route('/org_names')
def get_org_names():
    return request_router(request.full_path)


@app.route('/org_info')
def get_org_info():
    return request_router(request.full_path)


@app.route('/org_languages')
def get_languages_org():
    return request_router(request.full_path)


@app.route('/org_open_source')
def get_open_source_org():
    return request_router(request.full_path)


@app.route('/org_commits')
def get_commits_org():
    return request_router(request.full_path)


@app.route('/org_readme')
def get_readme_org():
    return request_router(request.full_path)


@app.route('/org_open_source_readme')
def get_open_source_readme_org():
    return request_router(request.full_path)


@app.route('/org_license')
def get_license_type_org():
    return request_router(request.full_path)


@app.route('/org_issues')
def get_issues_org():
    return request_router(request.full_path)


@app.route('/org_readme_languages')
def get_readme_languages():
    return request_router(request.full_path)


@app.route('/org_open_source_readme_languages')
def get_open_source_readme_languages():
    return request_router(request.full_path)


# Team
@app.route('/team_check_with_exist')
def team_check_with_exist():
    return request_router(request.full_path)


@app.route('/team_languages')
def get_languages_team():
    return request_router(request.full_path)


@app.route('/team_open_source')
def get_open_source_team():
    return request_router(request.full_path)


@app.route('/team_commits')
def get_commits_team():
    return request_router(request.full_path)


@app.route('/team_readme')
def get_readme_team():
    return request_router(request.full_path)


@app.route('/team_license')
def get_license_type_team():
    return request_router(request.full_path)


@app.route('/team_repo_members')
def get_repo_members_team():
    return request_router(request.full_path)


@app.route('/team_issues')
def get_issues_team():
    return request_router(request.full_path)


@app.route('/team_name')
def get_team_name():
    return request_router(request.full_path)


@app.route('/team_new_work')
def get_team_new_work():
    return request_router(request.full_path)


@app.route('/team_readme_languages')
def get_team_readme_languages():
    return request_router(request.full_path)


@app.route('/team_repositories_readme')
def get_team_repositories_readme():
    return request_router(request.full_path)


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


# Users
@app.route('/user_avatar')
def get_avatar():
    return request_router(request.full_path)


@app.route('/user_commit')
def get_user_commit():
    return request_router(request.full_path)


@app.route('/user_contributed_repo')
def get_user_contributed_repo():
    return request_router(request.full_path)


@app.route('/user_stats')
def get_user_stats():
    return request_router(request.full_path)


@app.route('/user_team')
def get_user_team():
    return request_router(request.full_path)


@app.route('/user_login')
def get_user_login():
    return request_router(request.full_path)


@app.route('/user_new_work')
def get_user_new_work():
    return request_router(request.full_path)


# Repo
@app.route('/repo_languages')
def get_languages_repo():
    return request_router(request.full_path)


@app.route('/repo_commits')
def get_commits_repo():
    return request_router(request.full_path)


@app.route('/repo_members')
def get_members_repo():
    return request_router(request.full_path)


@app.route('/repo_best_practices')
def get_best_practices_repo():
    return request_router(request.full_path)


@app.route('/repo_issues')
def get_issues_repo():
    return request_router(request.full_path)


@app.route('/repo_name')
def get_repo_name():
    return request_router(request.full_path)

