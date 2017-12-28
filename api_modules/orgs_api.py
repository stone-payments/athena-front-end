import datetime as dt
import json
from operator import itemgetter
from flask import request
from api_modules import db


def org_names():
    projection = {'_id': 0, 'org': 1}
    query_result = db.Org.find({}, projection)
    query_result = [dict(i) for i in query_result]
    print(query_result)
    return json.dumps(query_result)


def org_languages():
    name = request.args.get("name")
    query = [{'$match': {'org': name}},
             {'$unwind': "$languages"},
             {'$group': {
                 '_id': {
                     'language': "$languages.language",
                 },
                 'count': {'$sum': '$languages.size'}
             }},
             {'$sort': {'count': -1}},
             {'$project': {'_id': 0, "languages": "$_id.language", 'count': 1}}]

    query_result = db.Repo.aggregate(query)
    result = [dict(i) for i in query_result]
    print(result)
    soma = sum([language['count'] for language in result])
    print(soma)
    for x in result:
        x['count'] = round((x['count'] / soma * 100), 2)
    soma = sum([language['count'] for language in result])
    print(soma)
    print(result[:12])
    return json.dumps(result[:12])


def org_open_source():
    def find_key(array_to_be_find, keys):
        for key in keys:
            if not any(d['openSource'] is key for d in array_to_be_find):
                array_to_be_find.append({'count': 0, 'openSource': key})

    name = request.args.get("name")
    query = [{'$match': {'org': name}},
             {'$group': {
                 '_id': {
                     'openSource': "$openSource",
                 },
                 'count': {'$sum': 1}
             }},
             {'$sort': {'_id.openSource': 1}},
             {'$project': {'_id': 0, "openSource": "$_id.openSource", 'count': 1}}
             ]
    query_result = db.Repo.aggregate(query)
    open_source_type_list = [dict(i) for i in query_result]
    soma = sum([license_type['count'] for license_type in open_source_type_list])
    for open_source_status in open_source_type_list:
        if open_source_status['openSource'] is None:
            open_source_status['openSource'] = 'None'
        open_source_status['count'] = round(int(open_source_status['count']) / soma * 100, 1)
    if len(open_source_type_list) < 2:
        find_key(open_source_type_list, [True, False])
    open_source_type_list = sorted(open_source_type_list, key=itemgetter('openSource'), reverse=False)
    return json.dumps(open_source_type_list)


def org_commits():
    name = request.args.get("name")
    start_date = dt.datetime.strptime(request.args.get("startDate"), '%Y-%m-%d')
    end_date = dt.datetime.strptime(request.args.get("endDate"), '%Y-%m-%d') + dt.timedelta(seconds=86399)
    print(start_date)
    print(end_date)
    query = [{'$match': {'org': name, 'committedDate': {'$gte': start_date, '$lt': end_date}}},
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
    commits_count_list = db.Commit.aggregate(query)
    commits_count_list = [dict(i) for i in commits_count_list]
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


def org_readme():
    def find_key(array_to_be_find, keys):
        for key in keys:
            if not any(d['status'] == key for d in array_to_be_find):
                array_to_be_find.append({'count': 0, 'status': key})
    name = request.args.get("name")
    query = [{'$match': {'org': name}},
             {'$group': {
                 '_id': {
                     'status': "$readme",
                 },
                 'count': {'$sum': 1}
             }},
             {'$sort': {'_id.status': -1}},
             {'$project': {'_id': 0, "status": "$_id.status", 'count': 1}}
             ]
    query_result = db.Repo.aggregate(query)
    readme_status_list = [dict(i) for i in query_result]
    soma = sum([readme_status['count'] for readme_status in readme_status_list])
    for readme_status in readme_status_list:
        if readme_status['status'] is None:
            readme_status['status'] = 'None'
        readme_status['count'] = round(int(readme_status['count']) / soma * 100, 1)
    if len(readme_status_list) < 3:
        find_key(readme_status_list, ['None', 'Poor', 'OK'])
    readme_status_list = sorted(readme_status_list, key=itemgetter('status'), reverse=True)
    return json.dumps(readme_status_list)


def open_source_readme_org():
    def find_key(array_to_be_find, keys):
        for key in keys:
            if not any(d['status'] == key for d in array_to_be_find):
                array_to_be_find.append({'count': 0, 'status': key})
    name = request.args.get("name")
    query = [{'$match': {'org': name, 'openSource': True}},
             {'$group': {
                 '_id': {
                     'status': "$readme",
                 },
                 'count': {'$sum': 1}
             }},
             {'$sort': {'_id.status': -1}},
             {'$project': {'_id': 0, "status": "$_id.status", 'count': 1}}
             ]
    query_result = db.Repo.aggregate(query)
    readme_status_list = [dict(i) for i in query_result]
    soma = sum([readme_status['count'] for readme_status in readme_status_list])
    for readme_status in readme_status_list:
        if readme_status['status'] is None:
            readme_status['status'] = 'None'
        readme_status['count'] = round(int(readme_status['count']) / soma * 100, 1)
    if len(readme_status_list) < 3:
        find_key(readme_status_list, ['None', 'Poor', 'OK'])
    readme_status_list = sorted(readme_status_list, key=itemgetter('status'), reverse=True)
    return json.dumps(readme_status_list)


def org_license():
    name = request.args.get("name")
    query = [{'$match': {'org': name}},
             {'$group': {
                 '_id': {
                     'license': "$licenseType",
                 },
                 'count': {'$sum': 1}
             }},
             {'$project': {'_id': 0, "license": {'$ifNull': ["$_id.license", "None"]}, 'count': 1}}
             ]
    query_result = db.Repo.aggregate(query)
    license_type_list = [dict(i) for i in query_result]
    print(license_type_list)
    soma = sum([license_type['count'] for license_type in license_type_list])
    for license_type in license_type_list:
        license_type['count'] = round(int(license_type['count']) / soma * 100, 1)
    license_type_list = sorted(license_type_list, key=itemgetter('count'), reverse=True)
    return json.dumps(license_type_list)


def org_issues():
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
    start_date = dt.datetime.strptime(request.args.get("startDate"), '%Y-%m-%d')
    end_date = dt.datetime.strptime(request.args.get("endDate"), '%Y-%m-%d') + dt.timedelta(seconds=86399)
    delta = end_date - start_date
    query_created = [{'$match': {'org': name, 'createdAt': {'$gte': start_date, '$lte': end_date}}},
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
    query_closed = [{'$match': {'org': name, 'closedAt': {'$gte': start_date, '$lte': end_date}}},
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
    created_issues_list = process_data('Issue', query_created, delta)
    closed_issues_list = process_data('Issue', query_closed, delta)
    response = [closed_issues_list, created_issues_list]
    print(response)
    return json.dumps(response)


def org_info():
    name = request.args.get("name")
    query = {'org': name}
    projection = {'_id': 0, 'collection_name': 0}
    query_result = db.Org.find(query, projection)
    print(query_result)
    org_info_list = [dict(i) for i in query_result]
    org_info_list[0]['db_last_updated'] = round((dt.datetime.utcnow() -
                                                 org_info_list[0]['db_last_updated']).total_seconds() / 60)
    print(org_info_list)
    return json.dumps(org_info_list)
