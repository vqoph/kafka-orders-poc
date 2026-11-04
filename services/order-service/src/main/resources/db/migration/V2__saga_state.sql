-- Saga aggregation columns: NULL = result not received yet.

ALTER TABLE orders
    ADD COLUMN payment_success   BOOLEAN NULL,
    ADD COLUMN inventory_success BOOLEAN NULL;
