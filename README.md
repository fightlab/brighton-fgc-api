# HBK - API
## Habrewken API
**(Soon to be) Powering the Brighton Fighting Game Community**

## About

This branch ([`v3-dev`](https://github.com/fightlab/brighton-fgc-api/tree/v3-dev)) is the main development branch while we work on `v3` of the API.

To find out more about the current (live) version `v2`, and the project as a whole, see the [`master`](https://github.com/fightlab/brighton-fgc-api/tree/master) branch. The `v2` will no longer be updated while we work on `v3`, except for security or downtime patches.

`v3` is a complete rework of the database model, and APIs, meaning it is currently incompatible with the current version of the [frontend](https://github.com/fightlab/brighton-fgc-client).

## Requirements
You need this installed:
* [Docker](https://www.docker.com/)
* [docker-compose](https://docs.docker.com/compose/)

## Technologies
You don't need these if using docker:
* [Node.js](https://nodejs.org/en/)
* [Typescript](https://www.typescriptlang.org/)
* [MongoDB](https://www.mongodb.com/)

## Tooling
These are installed automatically if using docker:
* [Backpack](https://github.com/jaredpalmer/backpack)
* [jest](https://jestjs.io/)

## Development

Development mode can be handled using `docker-compose` using the service name `hbk-api`.

Start the service in the background:
```sh
$ docker-compose up -d
```

This spins up the app (service: `hbk-api`), a mongo database (service: `hbk-mongo`), and [mongo-express](https://github.com/mongo-express/mongo-express) (service: `hbk-mongo-express`), using the default parameters defined in `docker-compose.yml`

Access the logs using:
```sh
$ docker-compose logs -f
```

For running commands:
```sh
$ docker-compose run hbk-api <COMMAND>
# example:
$ docker-compose run hbk-api yarn test
```

To access the container shell:
```sh
$ docker-compose exec hbk-api /bin/sh
```

While using docker and docker-compose is preferable, you can still run this locally by populating environment variables into an `.env` file using the `.env.example` file as an example, installing dependencies using `yarn`, followed by `(set -a && source .env && yarn dev)` to run the development server. You'll need to have all the technologies installed and set up too.
