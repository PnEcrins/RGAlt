ARG NODE_MAJOR_VERSION=20

FROM ubuntu:noble AS base

ARG NODE_MAJOR_VERSION

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=UTC

RUN mkdir -p /app/backend app/front-end/dist && chown -R ubuntu:ubuntu /app
WORKDIR /app

RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get -qq update && apt-get -qq install -y --no-install-recommends \
        ca-certificates \
        curl \
        gnupg \
        python3.12 \
        binutils \
        gdal-bin \
        libproj-dev \
        libpq5 \
        nano \
        gettext

RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    curl -fsSL https://deb.nodesource.com/setup_${NODE_MAJOR_VERSION}.x | bash - && \
    apt-get -qq install -y nodejs

COPY .docker/entrypoint.sh /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/bin/sh", "-e", "/usr/local/bin/entrypoint.sh"]

FROM base AS build

ENV NODE_ENV=development
ARG NODE_MAJOR_VERSION

RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get -qq update && apt-get -qq install -y --no-install-recommends \
        git \
        python3.12-dev \
        python3.12-venv \
        build-essential \
        libpq-dev

USER ubuntu

COPY --chown=ubuntu:ubuntu front-end/ /app/front-end

WORKDIR /app/front-end

RUN npm ci --no-audit

WORKDIR /app

RUN --mount=type=cache,target=/home/ubuntu/.cache/pip,sharing=locked python3.12 -m venv /app/venv &&  \
    /app/venv/bin/pip install --upgrade pip wheel setuptools
COPY backend/requirements.txt /app/requirements.txt
RUN --mount=type=cache,target=/home/ubuntu/.cache/pip,sharing=locked  \
    /app/venv/bin/pip install -r /app/requirements.txt

FROM build AS dev

COPY backend/dev-requirements.txt /app/dev-requirements.txt
RUN --mount=type=cache,target=/home/ubuntu/.cache/pip,sharing=locked,uid=1,gid=1  \
    /app/venv/bin/pip install -r /app/dev-requirements.txt

WORKDIR /app/backend

CMD ["/app/venv/bin/python", "manage.py", "runserver", "0.0.0.0:8000"]

FROM base AS prod

ENV NODE_ENV=production

WORKDIR /app/backend

USER root
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get -qq update && apt-get -y full-upgrade

USER ubuntu

COPY --chown=ubuntu:ubuntu front-end/package-lock.json /app/front-end/package-lock.json
COPY --chown=ubuntu:ubuntu front-end/package.json /app/front-end/package.json

WORKDIR /app/front-end

RUN npm ci --no-audit --only=production

COPY --chown=ubuntu:ubuntu --from=build /app/venv /app/venv
COPY --chown=ubuntu:ubuntu --from=build /app/front-end/dist /app/front-end/dist
COPY --chown=ubuntu:ubuntu backend/project/ /app/backend
COPY --chown=ubuntu:ubuntu backend/manage.py /app/backend/manage.py

WORKDIR /app/backend

RUN /app/venv/bin/django-admin compilemessages

CMD ["/app/venv/bin/gunicorn", "project.wsgi:application", "--bind", "0.0.0.0:8000"]

FROM base AS front-dev

WORKDIR /app/front-end

USER ubuntu

COPY --chown=ubuntu:ubuntu front-end/ /app/front-end
COPY --chown=ubuntu:ubuntu --from=build /app/front-end/node_modules /app/front-end/node_modules

ENTRYPOINT [""]

CMD ["npx", "ng", "serve", "--host", "0.0.0.0"]
