# Standard install

- Unzip last release
- Copy .env.dist to .env
- Fill your VERSION and port mappings for containers
- Copy app.env.dist to app.env
- Fill your timezone and your server name (domain used in your browser)
- Copy db.env.dist to db.env
- Fill your database name, user and password
- Init instance

    ```bash
    docker compose run --rm back rga-update
    ```

- Create a first super user

    ```bash
    docker compose run --rm back ./manage.py createsuperuser
    ```

- Run instance

    ```bash
    docker compose up
    ```