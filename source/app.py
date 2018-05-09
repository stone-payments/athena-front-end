import sys
from importlib import import_module
from logging import basicConfig, DEBUG, getLogger, StreamHandler
from os.path import abspath, dirname, join, pardir

from flask import Flask

from base.routes import login_manager
from config import DebugConfig

# prevent python from writing *.pyc files / __pycache__ folders
sys.dont_write_bytecode = True

path_source = dirname(abspath(__file__))
path_parent = abspath(join(path_source, pardir))
if path_source not in sys.path:
    sys.path.append(path_source)


def register_extensions(app):
    login_manager.init_app(app)


def register_blueprints(app):
    for module_name in ('home', 'base'):
        module = import_module('{}.routes'.format(module_name))
        app.register_blueprint(module.blueprint)


def configure_logs(app):
    basicConfig(filename='error.log', level=DEBUG)
    logger = getLogger()
    logger.addHandler(StreamHandler())


def create_app(selenium=False):
    app = Flask(__name__, static_folder='base/static')
    app.config.from_object(DebugConfig)
    if selenium:
        app.config['LOGIN_DISABLED'] = True
    register_extensions(app)
    register_blueprints(app)
    configure_logs(app)
    return app


app = create_app()


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=7000, threaded=True)
