from operator import itemgetter
from bson import json_util
from api_client.client import *
from api_modules.module import *


def check_with_exist(db):
    org = request.args.get("org")
    name = request.args.get("name")
    query = {'org': org, 'slug': name}
    projection = {'_id': 1}
    query_result = query_find_to_dictionary(db, 'Teams', query, projection)
    if not query_result:
        return json.dumps({'response': 404})
    return json.dumps({'response': 200})


def team_languages(db):
    org = request.args.get("org")
    name = request.args.get("name")
    query = [
        {'$lookup': {'from': 'Teams', 'localField': 'to', 'foreignField': '_id', 'as': 'Teams'}},
        {'$lookup': {'from': 'Repo', 'localField': 'from', 'foreignField': '_id', 'as': 'Repo'}},
        {
            '$match':
                {'Teams.0.slug': name, 'type': 'repo_to_team', 'Teams.0.org': org}},
        {"$unwind": "$Repo"},
        {'$project': {'_id': 0, "languages": "$Repo.languages", 'count': 1}},
        {"$unwind": "$languages"},
        {'$project': {'_id': 0, "languages": "$languages", 'count': 1}},
        {'$group': {
            '_id': {
                'language': "$languages.language",
            },
            'count': {'$sum': '$languages.size'}
        }},
        {'$sort': {'count': -1}},
        {'$limit': 12},
        {'$project': {"language": "$_id.language", "_id": 0, 'count': 1}}
    ]
    query_result = db.edges.aggregate(query)
    readme_status_list = [dict(i) for i in query_result]
    soma = sum([readme_status['count'] for readme_status in readme_status_list])
    for readme_status in readme_status_list:
        if readme_status['language'] is None:
            readme_status['language'] = 'None'
        readme_status['count'] = round(int(readme_status['count']) / soma * 100, 1)
    return json.dumps(readme_status_list)


def team_open_source(db):
    org = request.args.get("org")
    name = request.args.get("name")
    query = [
        {'$lookup': {'from': 'Teams', 'localField': 'to', 'foreignField': '_id', 'as': 'Teams'}},
        {'$lookup': {'from': 'Repo', 'localField': 'from', 'foreignField': '_id', 'as': 'Repo'}},
        {
            '$match':
                {'Teams.0.slug': name, 'type': 'repo_to_team', 'Teams.0.org': org}},
        {'$group': {
            '_id': {
                'status': "$Repo.openSource",
            },
            'count': {'$sum': 1}
        }},
        {'$sort': {'_id.status': -1}},
        {'$project': {"status": "$_id.status", "_id": 0, 'count': 1}}
    ]
    query_result = db.edges.aggregate(query)
    if not query_result:
        return json.dumps([{'response': 404}])
    readme_status_list = [dict(i) for i in query_result]
    soma = sum([readme_status['count'] for readme_status in readme_status_list])
    for readme_status in readme_status_list:
        readme_status['status'] = readme_status['status'][0]
        readme_status['count'] = round(int(readme_status['count']) / soma * 100, 1)
    if len(readme_status_list) < 2:
        find_key(readme_status_list, [True, False])
    readme_status_list = sorted(readme_status_list, key=itemgetter('status'), reverse=False)
    return json.dumps(readme_status_list)


def team_commits(db):
    name = request.args.get("name")
    org = request.args.get("org")
    start_date = dt.datetime.strptime(request.args.get("startDate"), '%Y-%m-%d')
    end_date = dt.datetime.strptime(request.args.get("endDate"), '%Y-%m-%d') + dt.timedelta(seconds=86399)
    query = [
        {'$lookup': {'from': 'Teams', 'localField': 'to', 'foreignField': '_id', 'as': 'Team'}},
        {'$lookup': {'from': 'Dev', 'localField': 'from', 'foreignField': '_id', 'as': 'Devs'}},
        {
            '$match':
                {"Team.0.slug": name, 'type': 'dev_to_team', 'Team.0.org': org}
        },
        {'$project': {"_id": 0}},
        {'$lookup': {'from': 'edges', 'localField': 'Devs._id', 'foreignField': 'from', 'as': 'Commit2'}},
        {"$unwind": "$Commit2"},
        {
            '$match':
                {"Commit2.type": 'dev_to_commit'}
        },
        {'$lookup': {'from': 'Commit', 'localField': 'Commit2.to', 'foreignField': '_id', 'as': 'Commit3'}},
        {'$project': {"_id": 0, 'date': '$Commit3.committedDate'}},
        {'$match': {'date': {'$gte': start_date, '$lt': end_date}}},
        {"$unwind": "$date"},
        {'$group': {
            '_id': {
                'year': {'$year': "$date"},
                'month': {'$month': "$date"},
                'day': {'$dayOfMonth': "$date"},
            },
            'count': {'$sum': 1}
        }},
        {'$project': {"_id": 0, "year": "$_id.year", "month": "$_id.month", "day": "$_id.day", 'count': 1}}
    ]
    delta = end_date - start_date
    commits_count_list = db.edges.aggregate(query)
    commits_count_list = [dict(i) for i in commits_count_list]
    for commit_count in commits_count_list:
        commit_count['date'] = dt.datetime(commit_count['year'], commit_count['month'], commit_count['day'], 0, 0)
    days = [start_date + dt.timedelta(days=i) for i in range(delta.days + 1)]
    lst = [fill_all_dates(day, commits_count_list) for day in days]
    return json.dumps(lst)


def team_readme(db):
    org = request.args.get("org")
    name = request.args.get("name")
    query = [
        {'$lookup': {'from': 'Teams', 'localField': 'to', 'foreignField': '_id', 'as': 'Teams'}},
        {'$lookup': {'from': 'Repo', 'localField': 'from', 'foreignField': '_id', 'as': 'Repo'}},
        {
            '$match':
                {'Teams.0.slug': name, 'type': 'repo_to_team', 'Teams.0.org': org}},
        {'$group': {
            '_id': {
                'status': "$Repo.readme",
            },
            'count': {'$sum': 1}
        }},
        {'$sort': {'_id.status': -1}},
        {'$project': {"status": "$_id.status", "_id": 0, 'count': 1}}
    ]
    query_result = db.edges.aggregate(query)
    readme_status_list = [dict(i) for i in query_result]
    soma = sum([readme_status['count'] for readme_status in readme_status_list])
    for readme_status in readme_status_list:
        if readme_status['status'][0] is None:
            readme_status['status'] = 'None'
        else:
            readme_status['status'] = readme_status['status'][0]
        readme_status['count'] = round(int(readme_status['count']) / soma * 100, 1)
    if len(readme_status_list) < 3:
        find_key(readme_status_list, ['None', 'Poor', 'OK'])
    readme_status_list = sorted(readme_status_list, key=itemgetter('status'), reverse=True)
    return json.dumps(readme_status_list)


def team_license(db):
    org = request.args.get("org")
    name = request.args.get("name")
    query = [
        {'$lookup': {'from': 'Teams', 'localField': 'to', 'foreignField': '_id', 'as': 'Teams'}},
        {'$lookup': {'from': 'Repo', 'localField': 'from', 'foreignField': '_id', 'as': 'Repo'}},
        {
            '$match':
                {'Teams.0.slug': name, 'type': 'repo_to_team', 'Teams.0.org': org}},
        {'$group': {
            '_id': {
                'status': "$Repo.licenseType",
            },
            'count': {'$sum': 1}
        }},
        {'$sort': {'_id.count': -1}},
        {'$project': {"status": "$_id.status", "_id": 0, 'count': 1}}
    ]
    query_result = db.edges.aggregate(query)
    readme_status_list = [dict(i) for i in query_result]
    soma = sum([readme_status['count'] for readme_status in readme_status_list])
    for readme_status in readme_status_list:
        if readme_status['status'][0] is None:
            readme_status['status'] = 'None'
        else:
            readme_status['status'] = readme_status['status'][0]
        readme_status['count'] = round(int(readme_status['count']) / soma * 100, 1)
    return json.dumps(readme_status_list)


def team_repo_members(db):
    org = request.args.get("org")
    name = request.args.get("name")
    query = [
        {'$lookup': {'from': 'Teams', 'localField': 'to', 'foreignField': '_id', 'as': 'Teams'}},
        {'$lookup': {'from': 'Dev', 'localField': 'from', 'foreignField': '_id', 'as': 'Dev'}},
        {
            '$match':
                {'Teams.0.slug': name, 'type': 'dev_to_team', 'Teams.0.org': org}},
        {'$group': {
            '_id': {
                'member': "$Dev.login",
            }
        }},
        {'$sort': {'_id.member': 1}},
        {'$project': {"member": "$_id.member", "_id": 0}}
    ]
    query_result = query_aggregate_to_dictionary(db, 'edges', query)
    return json.dumps(query_result)


def team_name(db):
    name = "^" + str(request.args.get("name"))
    org = request.args.get("org")
    compiled_name = re.compile(r'%s' % name, re.I)
    query_result = db['Teams'].find({'slug': {'$regex': compiled_name}, 'org': org},
                                    {'_id': 0, 'slug': 1}).limit(6)
    result = [dict(i) for i in query_result]
    if not query_result:
        return json.dumps([{'response': 404}])
    return json.dumps(result)


def issues_team(db):
    name = request.args.get("name")
    org = request.args.get("org")
    start_date = dt.datetime.strptime(request.args.get("startDate"), '%Y-%m-%d')
    end_date = dt.datetime.strptime(request.args.get("endDate"), '%Y-%m-%d') + dt.timedelta(seconds=86399)
    delta = end_date - start_date
    query_created = [
        {'$lookup': {'from': 'Teams', 'localField': 'to', 'foreignField': '_id', 'as': 'Team'}},
        {'$lookup': {'from': 'Repo', 'localField': 'from', 'foreignField': '_id', 'as': 'Repos'}},
        {
            '$match':
                {"Team.0.slug": name, 'type': 'repo_to_team', 'Team.0.org': org}
        },
        {'$project': {"_id": 0}},
        {'$lookup': {'from': 'edges', 'localField': 'Repos._id', 'foreignField': 'from', 'as': 'Commit2'}},
        {"$unwind": "$Commit2"},
        {
            '$match':
                {"Commit2.type": 'issue_to_repo'}
        },
        {'$lookup': {'from': 'Issue', 'localField': 'Commit2.to', 'foreignField': '_id', 'as': 'Commit3'}},
        {'$project': {"_id": 0, 'date': '$Commit3.createdAt'}},
        {'$match': {'date': {'$gte': start_date, '$lt': end_date}}},
        {"$unwind": "$date"},
        {'$group': {
            '_id': {
                'year': {'$year': "$date"},
                'month': {'$month': "$date"},
                'day': {'$dayOfMonth': "$date"},
            },
            'count': {'$sum': 1}
        }},
        {'$project': {"_id": 0, "year": "$_id.year", "month": "$_id.month", "day": "$_id.day", 'count': 1}}
    ]
    query_closed = [
        {'$lookup': {'from': 'Teams', 'localField': 'to', 'foreignField': '_id', 'as': 'Team'}},
        {'$lookup': {'from': 'Repo', 'localField': 'from', 'foreignField': '_id', 'as': 'Repos'}},
        {
            '$match':
                {"Team.0.slug": name, 'type': 'repo_to_team', 'Team.0.org': org}
        },
        {'$project': {"_id": 0}},
        {'$lookup': {'from': 'edges', 'localField': 'Repos._id', 'foreignField': 'from', 'as': 'Commit2'}},
        {"$unwind": "$Commit2"},
        {
            '$match':
                {"Commit2.type": 'issue_to_repo'}
        },
        {'$lookup': {'from': 'Issue', 'localField': 'Commit2.to', 'foreignField': '_id', 'as': 'Commit3'}},
        {'$project': {"_id": 0, 'date': '$Commit3.closedAt'}},
        {'$match': {'date': {'$gte': start_date, '$lt': end_date}}},
        {"$unwind": "$date"},
        {'$group': {
            '_id': {
                'year': {'$year': "$date"},
                'month': {'$month': "$date"},
                'day': {'$dayOfMonth': "$date"},
            },
            'count': {'$sum': 1}
        }},
        {'$project': {"_id": 0, "year": "$_id.year", "month": "$_id.month", "day": "$_id.day", 'count': 1}}
    ]
    return process_issues(db, 'edges', delta, start_date, created=query_created, closed=query_closed)


def team_new_work(db):
    org = request.args.get("org")
    name = request.args.get("name")
    start_date = start_day_string_time()
    end_date = end_date_string_time()
    query = [{'$lookup': {'from': 'Teams', 'localField': 'to', 'foreignField': '_id', 'as': 'Team'}},
             {'$lookup': {'from': 'Dev', 'localField': 'from', 'foreignField': '_id', 'as': 'Devs'}},
             {
                 '$match':
                     {"Team.0.slug": name, 'type': 'dev_to_team', 'Team.0.org': org}
             },
             {'$project': {"_id": 0, 'Devs': 1}},
             {'$lookup': {'from': 'edges', 'localField': 'Devs._id', 'foreignField': 'from', 'as': 'Commit2'}},

             {"$unwind": "$Commit2"},
             {
                 '$match':
                     {"Commit2.type": 'dev_to_commit'}
             },
             {'$lookup': {'from': 'Commit', 'localField': 'Commit2.to', 'foreignField': '_id', 'as': 'Commit3'}},
             {'$project': {"_id": 0, 'date': '$Commit3.committedDate', 'author': '$Commit3.author',
                           'additions': '$Commit3.additions', 'deletions': '$Commit3.deletions'}},
             {'$match': {'date': {'$gte': start_date, '$lt': end_date}}},
             {"$unwind": "$author"}, {"$unwind": "$additions"}, {"$unwind": "$deletions"},
             {'$group': {
                 '_id': {'author': "$author"
                         },
                 'additions': {'$sum': '$additions'},
                 'deletions': {'$sum': '$deletions'},
                 'commits': {'$sum': 1},
             }},
             {'$project': {'_id': 0, 'author': '$_id.author',
                           'additions': '$additions', 'deletions': '$deletions', 'commits': '$commits'}}]
    query2 = [{'$lookup': {'from': 'Teams', 'localField': 'to', 'foreignField': '_id', 'as': 'Team'}},
              {'$lookup': {'from': 'Dev', 'localField': 'from', 'foreignField': '_id', 'as': 'Devs'}},
              {
                  '$match':
                      {"Team.0.slug": name, 'type': 'dev_to_team', 'Team.0.org': org}
              },
              {'$project': {"_id": 0, 'Devs': 1}},
              {'$lookup': {'from': 'edges', 'localField': 'Devs._id', 'foreignField': 'from', 'as': 'Commit2'}},

              {"$unwind": "$Commit2"},
              {
                  '$match':
                      {"Commit2.type": 'dev_to_commit'}
              },
              {'$lookup': {'from': 'Commit', 'localField': 'Commit2.to', 'foreignField': '_id', 'as': 'Commit3'}},
              {'$project': {"_id": 0, 'date': '$Commit3.committedDate', 'author': '$Commit3.author',
                            'additions': '$Commit3.additions', 'deletions': '$Commit3.deletions'}},
              {'$match': {'date': {'$gte': start_date, '$lt': end_date}}},
              {"$unwind": "$date"},
              {"$unwind": "$author"},

              {'$group': {
                  '_id': {
                      'author': "$author",
                      'year': {'$year': "$date"},
                      'month': {'$month': "$date"},
                      'day': {'$dayOfMonth': "$date"},
                  }
              }},
              {'$project': {"_id": 0, 'author': '$_id.author'}},
              {'$group': {
                  '_id': {
                      'author': "$author"
                  },
                  'totalAmount': {'$sum': 1}
              }},
              {'$project': {"_id": 0, 'author': '$_id.author', 'totalAmount': '$totalAmount'}}
              ]

    # delta = end_date - start_date
    commits_count_list = query_aggregate_to_dictionary(db, 'Commit', query)
    total_days_count = query_aggregate_to_dictionary(db, 'Commit', query2)
    print(total_days_count)
    all_days = [start_date + dt.timedelta(days=x) for x in range((end_date - start_date).days + 1)]
    working_days = sum(1 for d in all_days if d.weekday() < 5)
    print(working_days)
    if not commits_count_list:
        return json.dumps([[{'author': name, 'commits': 0, 'additions': 0, 'deletions': 0}, {'x': -100, 'y': -100}]])
    commits_ratio = int((total_days_count / working_days - 0.5) * 2 * 100)
    soma = commits_count_list[0]['additions'] + commits_count_list[0]['deletions']
    addittions_deletions_ratio = int((commits_count_list[0]['additions'] / soma - commits_count_list[0]['deletions'] /
                                      soma) * 100)
    [[{'author': name, 'commits': commits_count_list[0]['commits'],
       'additions': commits_count_list[0]['additions'], 'deletions':
           commits_count_list[0]['deletions']}, {'x': commits_ratio,
                                                 'y': addittions_deletions_ratio}]]
    # return json.dumps([[{'author': name, 'commits': commits_count_list[0]['commits'],
    #                      'additions': commits_count_list[0]['additions'], 'deletions':
    #                          commits_count_list[0]['deletions']}, {'x': commits_ratio,
    #                                                                'y': addittions_deletions_ratio}]])
