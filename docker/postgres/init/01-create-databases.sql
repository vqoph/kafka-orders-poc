-- Runs once, the first time the Postgres volume is created
-- (files in /docker-entrypoint-initdb.d are executed in alphabetical order).
-- One database per service: services never share tables, they only talk through Kafka.

CREATE DATABASE orders;
CREATE DATABASE payments;
CREATE DATABASE inventory;

-- notification-service has no database: it only forwards events to the browser (SSE).
