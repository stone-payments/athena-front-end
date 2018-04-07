.PHONY: virtualenv clean test install

activate_env:=. env/bin/activate

virtualenv:
	python3.6 -m venv env

clean:
	rm -rf env
	rm -rf docs/_build
	find . -name "*.pyc" -exec rm -f {} \;

install:
	$(call activate_env) && pip install -r requirements.txt

server-dev:
	$(call activate_env) && PYTHONPATH=. FLASK_APP=athena_ui.api:app FLASK_DEBUG=1 flask run

docker-build:
	docker build -t athena-ui:dev .

docker-run:
	docker run -p 5000:5000 athena-ui:dev

docker: docker-build docker-run

reset: clean virtualenv install