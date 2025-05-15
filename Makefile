back-lint:
	@echo "Running back-end linter...\n"
	docker compose run --remove-orphans --rm back ruff check --fix project
	docker compose run --rm back ruff format project

back-deps:
	@echo "Update back-end dependencies...\n"
	docker compose run --remove-orphans --rm back bash -c "uv pip compile ./requirements.in -o ./requirements.txt && uv pip compile ./requirements-dev.in -o ./requirements-dev.txt"
