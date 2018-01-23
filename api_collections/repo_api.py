from operator import itemgetter

from api_client.client import *
from api_modules.module import *


def repo_name(db):
    return name_and_org_regex_search(db, 'Repo', 'repoName')


def repo_languages(db):
    name = request.args.get("name")
    org = str(request.args.get("org"))
    query = {'org': org, 'repoName': name}
    projection = {"languages": 1, "_id": 0}
    result = query_find_to_dictionary(db, 'Repo', query, projection)
    if not result:
        return json.dumps([{'response': 404}])
    result = (result[0]['languages'])
    result = sorted(result, key=itemgetter('size'), reverse=True)
    return json.dumps(result)


def repo_commits(db):
    name = request.args.get("name")
    org = request.args.get("org")
    start_date = start_day_string_time()
    end_date = end_date_string_time()
    query = [{'$match': {'org': org, 'repoName': name, 'committedDate': {'$gte': start_date, '$lt': end_date}}},
             {'$group': {
                 '_id': {
                     'year': {'$year': "$committedDate"},
                     'month': {'$month': "$committedDate"},
                     'day': {'$dayOfMonth': "$committedDate"},
                 },
                 'count': {'$sum': 1}
             }},
             {'$project': {'_id': 0, "year": "$_id.year", "month": "$_id.month", "day": "$_id.day", 'count': 1}}
             ]
    delta = end_date - start_date
    commits_count_list = query_aggregate_to_dictionary(db, 'Commit', query)
    for commit_count in commits_count_list:
        commit_count['date'] = dt.datetime(commit_count['year'], commit_count['month'], commit_count['day'], 0, 0)
    days = [start_date + dt.timedelta(days=i) for i in range(delta.days + 1)]
    lst = [fill_all_dates(day, commits_count_list) for day in days]
    return json.dumps(lst)


def repo_members(db):
    name = request.args.get("name")
    org = str(request.args.get("org"))
    query = {'org': org, 'repoName': name, 'author': {'$ne': None}}
    projection = {'_id': 0, 'author': 1}
    query_result = query_find(db, 'Commit', query, projection).distinct("author")
    return json.dumps(query_result)


def repo_best_practices(db):
    name = request.args.get("name")
    org = str(request.args.get("org"))
    db_last_updated = dt.datetime.utcnow() + dt.timedelta(hours=-5)
    print(db_last_updated)
    query = {'org': org, 'repoName': name, 'db_last_updated': {'$gte': db_last_updated}}
    projection = {'_id': 0, 'repoName': 1, 'forks': 1, 'stargazers': 1, 'openSource': 1, 'licenseType': 1, 'readme': 1,
                  'db_last_updated': 1, 'description': 1}
    query_result = query_find_to_dictionary(db, 'Repo', query, projection)
    print(query_result)
    if not query_result:
        return json.dumps([{'response': 404}])
    query_result[0]['db_last_updated'] = round((dt.datetime.utcnow() -
                                                query_result[0]['db_last_updated']).total_seconds() / 60)
    return json.dumps(query_result)


def repo_issues(db):
    name = request.args.get("name")
    org = request.args.get("org")
    start_date = dt.datetime.strptime(request.args.get("startDate"), '%Y-%m-%d')
    end_date = dt.datetime.strptime(request.args.get("endDate"), '%Y-%m-%d') + dt.timedelta(seconds=86399)
    delta = end_date - start_date
    query_created = [{'$match': {'org': org, 'repoName': name, 'createdAt': {'$gte': start_date, '$lte': end_date}}},
                     {'$group': {
                         '_id': {
                             'year': {'$year': "$createdAt"},
                             'month': {'$month': "$createdAt"},
                             'day': {'$dayOfMonth': "$createdAt"},
                         },
                         'count': {'$sum': 1}
                     }},
                     {'$project': {'_id': 0, "year": "$_id.year", "month": "$_id.month", "day": "$_id.day", 'count': 1}}
                     ]
    query_closed = [{'$match': {'org': org, 'repoName': name, 'closedAt': {'$gte': start_date, '$lte': end_date}}},
                    {'$group': {
                        '_id': {
                            'year': {'$year': "$closedAt"},
                            'month': {'$month': "$closedAt"},
                            'day': {'$dayOfMonth': "$closedAt"},
                        },
                        'count': {'$sum': 1}
                    }},
                    {'$project': {'_id': 0, "year": "$_id.year", "month": "$_id.month", "day": "$_id.day", 'count': 1}}
                    ]
    created_issues_list = process_data(db, 'Issue', query_created, delta, start_date)
    created_issues_list = accumulator(created_issues_list)
    closed_issues_list = process_data(db, 'Issue', query_closed, delta, start_date)
    closed_issues_list = accumulator(closed_issues_list)
    response = [closed_issues_list, created_issues_list]
    return json.dumps(response)
