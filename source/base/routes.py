from flask import Blueprint
from flask_login import (
    LoginManager
)

# start the login system
login_manager = LoginManager()

blueprint = Blueprint(
    'base_blueprint',
    __name__,
    url_prefix='',
    template_folder='templates',
    static_folder='static'
)



