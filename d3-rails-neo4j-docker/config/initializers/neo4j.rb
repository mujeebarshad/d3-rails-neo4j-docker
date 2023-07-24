# frozen_string_literal: true

Rails.application.config.neo4j.driver.url = ENV['NEO4J_CONFIG_URL']#'bolt://127.0.0.1:7687'
Rails.application.config.neo4j.driver.username = ENV['NEO4J_CONFIG_USERNAME']#'neo4j'
Rails.application.config.neo4j.driver.password = ENV['NEO4J_CONFIG_PASSWORD']#'admin'
Rails.application.config.neo4j.driver.encryption = false
