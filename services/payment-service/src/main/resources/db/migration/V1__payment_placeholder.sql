-- Placeholder so Flyway has at least one migration.
-- Real payment persistence can come later; Kafka is the focus of step 5.

CREATE TABLE IF NOT EXISTS schema_placeholder (
    id INT PRIMARY KEY
);
