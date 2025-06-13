# Standard install

- Unzip last release
- Copy .env.dist to .env
- Fill your VERSION and port mappings for containers
- Copy app.env.dist to app.env
- Fill your timezone and your server name (domain used in your browser)
- Copy db.env.dist to db.env
- Fill your database name, user and password
- Copy conf/custom.py.dist to conf/custom.py
- Edit conf/custom.py to enable and configure S3 file backend (use app.env to set environment variables)
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
  
# Upgrade

- Take care of release notes between your version and new one
- If specified, update your installation files with new ones
- Check or update your target version in .env file (latest by default)
- Pull new docker images

    ```bash
    docker compose pull
    ```
- Execute post update script

    ```bash
    docker compose run --rm back rga-update
    ```
- Restart instance

    ```bash
    docker compose down  
    docker compose up -d
    ```