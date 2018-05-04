import io
import json

import xlsxwriter
from flask import Blueprint, render_template, request, send_file

from .module import request_router, json_to_excel

blueprint = Blueprint(
    'home_blueprint',
    __name__,
    url_prefix='',
    template_folder='templates',
    static_folder='static'
)


@blueprint.route('/')
@blueprint.route('/orgs')
@blueprint.route('/index')
def index():
    return render_template('organizations.html')


@blueprint.route('/repos')
def repos():
    return render_template('repositories.html')


@blueprint.route('/teams')
def teams():
    return render_template('teams.html')


@blueprint.route('/users')
def users():
    return render_template('profile.html')


@blueprint.route('/proxy/<path:path>')
def proxy(path):
    return request_router(f"/{path}?{request.query_string.decode('utf-8')}")


@blueprint.route('/report_consolidate_readme')
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


@blueprint.route('/report_readme')
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


@blueprint.route('/report_team_repository_info')
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


@blueprint.errorhandler(403)
def access_forbidden(error):
    return render_template('errors/page_403.html'), 403


@blueprint.errorhandler(404)
def not_found_error(error):
    return render_template('errors/page_404.html'), 404


@blueprint.errorhandler(500)
def internal_error(error):
    return render_template('errors/page_500.html'), 500


@blueprint.route('/index2')
def index2():
    return render_template('index2.html')
