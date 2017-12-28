import datetime as dt
from flask import request
import re
import json


def query_find_to_dictionary(db, collection, query, projection):
    query_result = db[collection].find(query, projection)
    return [dict(i) for i in query_result]


def query_find(db, collection, query, projection):
    return db[collection].find(query, projection)


def query_aggregate_to_dictionary(db, collection, query):
    query_result = db[collection].aggregate(query)
    return [dict(i) for i in query_result]


def start_day_string_time():
    return dt.datetime.strptime(request.args.get("startDate"), '%Y-%m-%d')


def end_date_string_time():
    return dt.datetime.strptime(request.args.get("endDate"), '%Y-%m-%d') + dt.timedelta(seconds=86399)


def fill_all_dates(day_in_range, collection_count_list):
    day = {}
    for y in collection_count_list:
        if y.get('date') == day_in_range:
            day['day'] = str(y.get('date').strftime('%a %d-%b'))
            day['count'] = int(y.get('count'))
            return day
    day['day'] = day_in_range.strftime('%a %d-%b')
    day['count'] = 0
    return day


def process_data(db, db_collection, db_query, days_delta, start_date):
    count_list = db[db_collection].aggregate(db_query)

    count_list = [dict(i) for i in count_list]
    for count in count_list:
        count['date'] = dt.datetime(count['year'], count['month'], count['day'], 0, 0)
    range_days = [start_date + dt.timedelta(days=i) for i in range(days_delta.days + 1)]
    processed_list = []
    for day in range_days:
        processed_list.append(fill_all_dates(day, count_list))
    return processed_list


def name_regex_search(db, collection_name, document_name):
    name = "^" + str(request.args.get("name"))
    compiled_name = re.compile(r'%s' % name, re.I)
    query_result = db[collection_name].find({document_name: {'$regex': compiled_name}},
                                            {'_id': 0, document_name: 1}).limit(6)
    result = [dict(i) for i in query_result]
    if not query_result:
        return json.dumps([{'response': 404}])
    return json.dumps(result)


def name_and_org_regex_search(db, collection_name, document_name):
    org = str(request.args.get("org"))
    name = "^" + str(request.args.get("name"))
    compiled_name = re.compile(r'%s' % name, re.I)
    query_result = db[collection_name].find({'org': org, document_name: {'$regex': compiled_name}},
                                            {'_id': 0, document_name: 1}).limit(6)
    result = [dict(i) for i in query_result]
    if not query_result:
        return json.dumps([{'response': 404}])
    return json.dumps(result)
