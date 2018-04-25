from flask import Blueprint, render_template, redirect, request, url_for
from flask_login import (
    LoginManager
)
from .forms import LoginForm, CreateAccountForm

# start the login system
login_manager = LoginManager()

blueprint = Blueprint(
    'base_blueprint',
    __name__,
    url_prefix='',
    template_folder='templates',
    static_folder='static'
)


@blueprint.route('/')
def route_default():
    return redirect('/home/index')


@blueprint.route('/<template>')
def route_template(template):
    return render_template(template + '.html')


@blueprint.route('/fixed_<template>')
def route_fixed_template(template):
    return render_template('fixed/fixed_{}.html'.format(template))


@blueprint.route('/page_<error>')
def route_errors(error):
    return render_template('errors/page_{}.html'.format(error))


## Errors


@login_manager.unauthorized_handler
def unauthorized_handler():
    return render_template('errors/page_403.html'), 403


@blueprint.errorhandler(403)
def access_forbidden(error):
    return render_template('errors/page_403.html'), 403


@blueprint.errorhandler(404)
def not_found_error(error):
    return render_template('errors/page_404.html'), 404


@blueprint.errorhandler(500)
def internal_error(error):
    return render_template('errors/page_500.html'), 500
