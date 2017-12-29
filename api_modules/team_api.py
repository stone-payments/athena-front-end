from flask import request
from .config import *
import datetime as dt
import re
import json
from operator import itemgetter
from .module import *


def check_with_exist():
    org = request.args.get("org")
    name = request.args.get("name")
    query = {'org': org, 'slug': name}
    query_result = db['Teams'].find(query)
    query_result = [dict(i) for i in query_result]
    if not query_result:
        return json.dumps({'response': 404})
    return json.dumps({'response': 200})


def team_languages():
    org = request.args.get("org")
    name = request.args.get("name")
    query = [
        {'$lookup': {'from': 'Repo', 'localField': 'from', 'foreignField': '_id', 'as': 'Repo'}}
        , {'$lookup': {'from': 'Teams', 'localField': 'to', 'foreignField': '_id', 'as': 'Teams'}},
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
    print(readme_status_list)
    soma = sum([readme_status['count'] for readme_status in readme_status_list])
    for readme_status in readme_status_list:
        print(readme_status)
        if readme_status['language'] is None:
            readme_status['language'] = 'None'
        # else:
        #     readme_status['languages'] = readme_status['languages'][0]
        readme_status['count'] = round(int(readme_status['count']) / soma * 100, 1)
    print(readme_status_list)
    return json.dumps(readme_status_list)


def team_open_source():
    org = request.args.get("org")
    name = request.args.get("name")
    query = [
        {'$lookup': {'from': 'Repo', 'localField': 'from', 'foreignField': '_id', 'as': 'Repo'}}
        , {'$lookup': {'from': 'Teams', 'localField': 'to', 'foreignField': '_id', 'as': 'Teams'}},
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
    print(readme_status_list)
    soma = sum([readme_status['count'] for readme_status in readme_status_list])
    for readme_status in readme_status_list:
        # if readme_status['status'][0] is None:
        #     readme_status['status'] = 'None'
        # else:
        readme_status['status'] = readme_status['status'][0]
        readme_status['count'] = round(int(readme_status['count']) / soma * 100, 1)
    if len(readme_status_list) < 2:
        find_key(readme_status_list, [True, False])
    readme_status_list = sorted(readme_status_list, key=itemgetter('status'), reverse=False)
    print(readme_status_list)
    return json.dumps(readme_status_list)


def team_commits():
    name = request.args.get("name")
    org = request.args.get("org")
    start_date = dt.datetime.strptime(request.args.get("startDate"), '%Y-%m-%d')
    end_date = dt.datetime.strptime(request.args.get("endDate"), '%Y-%m-%d') + dt.timedelta(seconds=86399)
    print(start_date)
    print(end_date)
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
    # if not commits_count_list:
    #     return json.dumps([{'response': 404}])
    print(commits_count_list)
    for commit_count in commits_count_list:
        commit_count['date'] = dt.datetime(commit_count['year'], commit_count['month'], commit_count['day'], 0, 0)
    print(commits_count_list)
    days = [start_date + dt.timedelta(days=i) for i in range(delta.days + 1)]
    print(days)
    lst = []

    def fill_all_dates(x):
        day = {}
        for y in commits_count_list:
            if y.get('date') == x:
                day['day'] = str(y.get('date').strftime('%a %d-%b'))
                day['count'] = int(y.get('count'))
                return day
        day['day'] = x.strftime('%a %d-%b')
        day['count'] = 0
        return day

    for x in days:
        lst.append(fill_all_dates(x))
    print(lst)
    return json.dumps(lst)


def team_readme():
    org = request.args.get("org")
    name = request.args.get("name")
    query = [
        {'$lookup': {'from': 'Repo', 'localField': 'from', 'foreignField': '_id', 'as': 'Repo'}}
        , {'$lookup': {'from': 'Teams', 'localField': 'to', 'foreignField': '_id', 'as': 'Teams'}},
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
    print(readme_status_list)
    soma = sum([readme_status['count'] for readme_status in readme_status_list])
    for readme_status in readme_status_list:
        if readme_status['status'][0] is None:
            readme_status['status'] = 'None'
        else:
            readme_status['status'] = readme_status['status'][0]
        readme_status['count'] = round(int(readme_status['count']) / soma * 100, 1)
    if len(readme_status_list) < 3:
        find_key(readme_status_list, ['None', 'Poor', 'OK'])
    print(readme_status_list)
    readme_status_list = sorted(readme_status_list, key=itemgetter('status'), reverse=True)
    print(readme_status_list)
    return json.dumps(readme_status_list)


def team_license():
    org = request.args.get("org")
    name = request.args.get("name")
    query = [
        {'$lookup': {'from': 'Repo', 'localField': 'from', 'foreignField': '_id', 'as': 'Repo'}}
        , {'$lookup': {'from': 'Teams', 'localField': 'to', 'foreignField': '_id', 'as': 'Teams'}},
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
    print(readme_status_list)
    soma = sum([readme_status['count'] for readme_status in readme_status_list])
    for readme_status in readme_status_list:
        if readme_status['status'][0] is None:
            readme_status['status'] = 'None'
        else:
            readme_status['status'] = readme_status['status'][0]
        readme_status['count'] = round(int(readme_status['count']) / soma * 100, 1)
    print(readme_status_list)
    return json.dumps(readme_status_list)


def team_repo_members():
    org = request.args.get("org")
    name = request.args.get("name")
    query = [
        {'$lookup': {'from': 'Dev', 'localField': 'from', 'foreignField': '_id', 'as': 'Dev'}}
        , {'$lookup': {'from': 'Teams', 'localField': 'to', 'foreignField': '_id', 'as': 'Teams'}},
        {
            '$match':
                {'Teams.0.slug': name, 'type': 'dev_to_team', 'Teams.0.org': org}},
        {'$group': {
            '_id': {
                'data': "$Dev.login",
            },
            'count': {'$sum': 1}
        }},
        {'$sort': {'_id.data': 1}},
        {'$project': {"member": "$_id.data", "_id": 0, 'count': 1}}
    ]
    query_result = db.edges.aggregate(query)
    readme_status_list = [dict(i) for i in query_result]
    print(readme_status_list)
    soma = sum([readme_status['count'] for readme_status in readme_status_list])
    for readme_status in readme_status_list:
        if readme_status['member'][0] is None:
            readme_status['member'] = 'None'
        else:
            readme_status['member'] = readme_status['member'][0]
        readme_status['count'] = round(int(readme_status['count']) / soma * 100, 1)
    print(readme_status_list)
    return json.dumps(readme_status_list)


def team_name():
    name = "^" + str(request.args.get("name"))
    org = request.args.get("org")
    compiled_name = re.compile(r'%s' % name, re.I)
    query_result = db['Teams'].find({'slug': {'$regex': compiled_name}, 'org': org},
                                    {'_id': 0, 'slug': 1}).limit(6)
    result = [dict(i) for i in query_result]
    if not query_result:
        return json.dumps([{'response': 404}])
    print(result)
    return json.dumps(result)


def issues_team():
    def fill_all_dates(day_in_range, issue_count_list):
        days = {}
        for issue in issue_count_list:
            if issue.get('date') == day_in_range:
                days['day'] = str(issue.get('date').strftime('%a %d-%b'))
                days['count'] = int(issue.get('count'))
                return days
        days['day'] = day_in_range.strftime('%a %d-%b')
        days['count'] = 0
        return days

    def accumulator(days):
        value_accumulated = 0
        for day in days:
            if day["count"] > 0:
                value_accumulated += day["count"]
                day["count"] = value_accumulated
            else:
                day["count"] = value_accumulated
        return days

    def process_data(db_collection, db_query, days_delta):
        count_list = db[db_collection].aggregate(db_query)
        count_list = [dict(i) for i in count_list]
        for count in count_list:
            count['date'] = dt.datetime(count['year'], count['month'], count['day'], 0, 0)
        range_days = [start_date + dt.timedelta(days=i) for i in range(days_delta.days + 1)]
        processed_list = []
        for day in range_days:
            processed_list.append(fill_all_dates(day, count_list))
        processed_list = accumulator(processed_list)
        return processed_list

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
    created_issues_list = process_data('edges', query_created, delta)
    closed_issues_list = process_data('edges', query_closed, delta)
    response = [closed_issues_list, created_issues_list]
    print(response)
    return json.dumps(response)
