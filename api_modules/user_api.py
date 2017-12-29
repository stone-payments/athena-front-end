from .config import *
from .client import *
from .module import *


def avatar():
    name = request.args.get("login")
    query = {'login': name}
    projection = {'_id': 0, 'collection_name': 0}
    query_result = query_find_to_dictionary(db, 'Dev', query, projection)
    if not query_result:
        return json.dumps([{'response': 404}])
    query_result[0]['db_last_updated'] = round((dt.datetime.utcnow() -
                                                query_result[0]['db_last_updated']).total_seconds() / 60)
    query_result[0]['response'] = 200
    return json.dumps(query_result)


def user_commit():
    name = request.args.get("name")
    start_date = start_day_string_time()
    end_date = end_date_string_time()
    query = [{'$match': {'author': name, 'committedDate': {'$gte': start_date, '$lt': end_date}}},
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
    for commit_count in commits_count_list:
        commit_count['date'] = dt.datetime(commit_count['year'], commit_count['month'], commit_count['day'], 0, 0)
    days = [start_date + dt.timedelta(days=i) for i in range(delta.days + 1)]
    lst = []
    for x in days:
        lst.append(fill_all_dates(x, commits_count_list))
    return json.dumps(lst)


def user_contributed_repo():
    name = request.args.get("name")
    start_date = start_day_string_time()
    end_date = end_date_string_time()
    query = {'author': name, 'committedDate': {'$gte': start_date, '$lt': end_date}}
    projection = {'_id': 0, 'repoName': 1}
    query_result = query_find(db, 'Commit', query, projection).distinct("repoName")
    return json.dumps(query_result)


def user_stats():
    name = request.args.get("name")
    start_date = start_day_string_time()
    end_date = end_date_string_time()
    delta = end_date - start_date
    query_addttions = [
        {'$match': {'author': name, 'committedDate': {'$gte': start_date, '$lte': end_date}}},
        {
            '$group':
                {
                    '_id': {'author': "$author",
                            'year': {'$year': "$committedDate"},
                            'month': {'$month': "$committedDate"},
                            'day': {'$dayOfMonth': "$committedDate"},
                            },
                    'totalAmount': {'$sum': '$additions'}
                }
        },
        {'$project': {'_id': 0, "year": "$_id.year", "month": "$_id.month", "day": "$_id.day", 'author': '$_id.author',
                      'count': '$totalAmount'}}
    ]
    query_deletions = [
        {'$match': {'author': name, 'committedDate': {'$gte': start_date, '$lte': end_date}}},
        {
            '$group':
                {
                    '_id': {'author': "$author",
                            'year': {'$year': "$committedDate"},
                            'month': {'$month': "$committedDate"},
                            'day': {'$dayOfMonth': "$committedDate"},
                            },
                    'totalAmount': {'$sum': '$deletions'}
                }
        },
        {'$project': {'_id': 0, "year": "$_id.year", "month": "$_id.month", "day": "$_id.day", 'author': '$_id.author',
                      'count': '$totalAmount'}}
    ]
    additions_list = process_data(db, 'Commit', query_addttions, delta, start_date)
    deletions_list = process_data(db, 'Commit', query_deletions, delta, start_date)
    response = [additions_list, deletions_list]
    return json.dumps(response)


def user_team():
    name = request.args.get("name")
    query = [{'$lookup': {
        'from': 'Teams', 'localField': 'to', 'foreignField': '_id', 'as': 'Team'}}
        , {'$lookup': {
            'from': 'Dev', 'localField': 'from', 'foreignField': '_id', 'as': 'Dev'}},
        {
            '$match':
                {"Dev.0.login": name, 'type': 'dev_to_team', 'data.db_last_updated': {'$gte': utc_time_datetime_format(-1)}}
        },
        {'$sort': {'Team.teamName': 1}},
        {'$project': {'_id': 0, "Team.teamName": 1, 'Team.org': 1}}
    ]
    result = query_aggregate_to_dictionary(db, 'edges', query)
    result = [x['Team'][0] for x in result]
    return json.dumps(result)


def user_login():
    return name_regex_search(db, 'Dev', 'login')
