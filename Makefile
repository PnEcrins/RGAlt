back-lint:
	@echo "Running back-end linter...\n"
	docker compose run --rm back black .
	docker compose run --rm back isort .
	docker compose run --rm back flake8 .

back-deps:
	@echo "Update back-end dependencies...\n"
	docker compose run --rm back bash -c "pip-compile --strip-extras && pip-compile --strip-extras dev-requirements.in"