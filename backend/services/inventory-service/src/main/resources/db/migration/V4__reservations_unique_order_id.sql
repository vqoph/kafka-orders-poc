-- At most one reservation decision per order (business idempotency on redelivery).
CREATE UNIQUE INDEX uk_reservations_order_id ON reservations (order_id);
