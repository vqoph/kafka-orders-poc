-- Payment decisions persisted before publishing payments.processed (same dual-write idea as orders).

CREATE TABLE payments (
    id            UUID PRIMARY KEY,
    order_id      UUID           NOT NULL,
    amount        NUMERIC(19, 2) NOT NULL,
    success       BOOLEAN        NOT NULL,
    processed_at  TIMESTAMPTZ    NOT NULL
);

CREATE INDEX idx_payments_order_id ON payments (order_id);
