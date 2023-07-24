# ECommerce Visualization

This is a Docker-based setup for running a Rails application with Neo4j database. The Rails application is found in the `d3-rails-neo4j-docker` directory.

## Docker Compose Configuration

This docker-compose file sets up two services: `app` and `neo4j`.

The `app` service builds an image from the Dockerfile in the `./d3-rails-neo4j-docker` directory. This image is run on a linux/amd64 platform. The service removes any stale PID files before starting the Rails server on port 3000.

The `neo4j` service runs the Neo4j community edition image version 4.4.5 on a linux/amd64 platform.

## Setup

Follow these steps to set up and run the services:

1. Install Docker and Docker Compose if not already installed.
2. Clone this repository.
3. Navigate to the directory containing the `docker-compose.yml` file.
4. Update or provide the path of neo4j `$HOME/docker-neo4j/data:/data` accordingly.
5. Run `docker-compose build` to build the Docker images.
6. Run `docker-compose up` to start the containers.

Your Rails application will be available on `http://localhost:3000`, and your Neo4j database browser will be accessible at `http://localhost:7475`.

## Database Seed

To run the seed file rake task after the db setup, execute the following command:

```
docker-compose run app rails db:seed
```

This will run the seed task inside the `app` service container, allowing it to interact with the database properly.

## Environment Variables

The `app` service uses two environment variables for connecting to the Neo4j database:

- `NEO4J_CONFIG_URL`: the connection string URL for the Neo4j database.
- `NEO4J_CONFIG_USERNAME`: the username to connect to the Neo4j database.
- `NEO4J_CONFIG_PASSWORD`: the password to connect to the Neo4j database.

These variables are set to `bolt://host.docker.internal:7687`, `neo4j`, and `admin` respectively by default. If you need to change these, update the values in the `docker-compose.yml` file.

## Ports

Ports `3000` and `7475` are exposed on your host machine for the Rails application and Neo4j respectively. If you need to change these ports, update the `docker-compose.yml` file accordingly.
