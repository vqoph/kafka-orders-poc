-- Extra catalog SKUs for Lab 4 / UI (SKU A already seeded in V1).
INSERT INTO stock (sku, quantity) VALUES ('B', 500)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO stock (sku, quantity) VALUES ('SKU-001', 100)
ON CONFLICT (sku) DO NOTHING;
