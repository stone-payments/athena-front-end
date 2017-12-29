from flask import Flask
from flask_cors import CORS
from api_modules import *


app = Flask(__name__, static_url_path='/static')
CORS(app)

with open("static/assets/js/configs.js", "w") as config_js:
    config_js.write('let address = "'+os.getenv("API_URL")+'"')

# Repos #####


@app.route('/get_languages_repo')
def get_languages_repo():
    response = repo_languages()
    return response


@app.route('/get_commits_repo')
def get_commits_repo():
    response = repo_commits()
    return response


@app.route('/get_members_repo')
def get_members_repo():
    response = repo_members()
    return response


@app.route('/get_best_practices_repo')
def get_best_practices_repo():
    response = repo_best_practices()
    return response


@app.route('/get_issues_repo')
def get_issues_repo():
    response = repo_issues()
    return response


@app.route('/get_repo_name')
def get_repo_name():
    response = repo_name()
    return response

# Orgs ############


@app.route('/get_org_names')
def get_org_names():
    response = org_names()
    return response


@app.route('/get_org_info')
def get_org_info():
    response = org_info()
    return response


@app.route('/get_languages_org')
def get_languages_org():
    response = org_languages()
    return response


@app.route('/get_open_source_org')
def get_open_source_org():
    response = org_open_source()
    return response


@app.route('/get_commits_org')
def get_commits_org():
    response = org_commits()
    return response


@app.route('/get_readme_org')
def get_readme_org():
    response = org_readme()
    return response


@app.route('/get_open_source_readme_org')
def get_open_source_readme_org():
    response = open_source_readme_org()
    return response


@app.route('/get_license_type_org')
def get_license_type_org():
    response = org_license()
    return response


@app.route('/get_issues_org')
def get_issues_org():
    response = org_issues()
    return response


# Teams ###
@app.route('/team_check_with_exist')
def team_check_with_exist():
    response = check_with_exist()
    return response


@app.route('/get_languages_team')
def get_languages_team():
    response = team_languages()
    return response


@app.route('/get_open_source_team')
def get_open_source_team():
    response = team_open_source()
    return response


@app.route('/get_commits_team')
def get_commits_team():
    response = team_commits()
    return response


@app.route('/get_readme_team')
def get_readme_team():
    response = team_readme()
    return response


@app.route('/get_license_type_team')
def get_license_type_team():
    response = team_license()
    return response


@app.route('/get_repo_members_team')
def get_repo_members_team():
    response = team_repo_members()
    return response


@app.route('/get_issues_team')
def get_issues_team():
    response = issues_team()
    return response


# Users #########################


@app.route('/get_avatar')
def get_avatar():
    response = avatar()
    return response


@app.route('/get_user_commit')
def get_user_commit():
    response = user_commit()
    return response


@app.route('/get_user_contributed_repo')
def get_user_contributed_repo():
    response = user_contributed_repo()
    return response


@app.route('/get_user_stats')
def get_user_stats():
    response = user_stats()
    return response


@app.route('/get_user_team')
def get_user_team():
    response = user_team()
    return response


@app.route('/get_team_name')
def get_team_name():
    response = team_name()
    return response


@app.route('/get_user_login')
def get_user_login():
    response = user_login()
    return response


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=os.getenv("PORT"))


