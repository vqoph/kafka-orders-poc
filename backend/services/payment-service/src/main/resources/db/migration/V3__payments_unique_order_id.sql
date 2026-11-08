-- At most one payment decision per order (business idempotency on redelivery).
CREATE UNIQUE INDEX uk_payments_order_id ON payments (order_id);
