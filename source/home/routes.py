from flask import Blueprint, render_template

blueprint = Blueprint(
    'home_blueprint',
    __name__,
    url_prefix='/home',
    template_folder='templates',
    static_folder='static'
)


@blueprint.route('/index')
def index():
    return render_template('index.html')


@blueprint.route('/index2')
def index2():
    return render_template('index2.html')

# @blueprint.route('/<template>')
# def route_template(template):
#     print(template)
#     return render_template(template + '.html')
