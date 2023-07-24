FROM ruby:3.2.0
RUN apt-get update -qq && apt-get install -y build-essential nodejs
RUN mkdir /d3-rails-neo4j-docker
WORKDIR /d3-rails-neo4j-docker
ADD Gemfile /d3-rails-neo4j-docker/Gemfile
ADD Gemfile.lock /d3-rails-neo4j-docker/Gemfile.lock
RUN bundle install
ADD . /d3-rails-neo4j-docker
