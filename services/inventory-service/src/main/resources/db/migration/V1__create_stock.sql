-- Stock levels + reservations (dual-write before inventory.reserved).

CREATE TABLE stock (
    sku       VARCHAR(64) PRIMARY KEY,
    quantity  INT         NOT NULL CHECK (quantity >= 0)
);

CREATE TABLE reservations (
    id          UUID PRIMARY KEY,
    order_id    UUID         NOT NULL,
    success     BOOLEAN      NOT NULL,
    reserved_at TIMESTAMPTZ  NOT NULL
);

CREATE TABLE reservation_items (
    reservation_id UUID         NOT NULL REFERENCES reservations (id) ON DELETE CASCADE,
    sku            VARCHAR(64)  NOT NULL,
    quantity       INT          NOT NULL CHECK (quantity > 0),
    PRIMARY KEY (reservation_id, sku)
);

CREATE INDEX idx_reservations_order_id ON reservations (order_id);

-- Seed for tutorial curls (sku A).
INSERT INTO stock (sku, quantity) VALUES ('A', 1000);
