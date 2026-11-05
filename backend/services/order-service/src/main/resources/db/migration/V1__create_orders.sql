-- Flyway migration: versioned schema (like MikroORM migrations).
-- File name pattern: V{version}__{description}.sql

CREATE TABLE orders (
    id           UUID PRIMARY KEY,
    customer_id  VARCHAR(64)  NOT NULL,
    amount       NUMERIC(19, 2) NOT NULL,
    status       VARCHAR(32)  NOT NULL,
    created_at   TIMESTAMPTZ  NOT NULL
);

CREATE TABLE order_items (
    order_id  UUID         NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
    sku       VARCHAR(64)  NOT NULL,
    quantity  INT          NOT NULL CHECK (quantity > 0),
    PRIMARY KEY (order_id, sku)
);

CREATE INDEX idx_orders_customer_id ON orders (customer_id);
CREATE INDEX idx_orders_status ON orders (status);
