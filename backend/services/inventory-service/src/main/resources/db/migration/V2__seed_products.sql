-- Extra catalog SKUs (SKU-001 already seeded in V1).
INSERT INTO stock (sku, quantity) VALUES ('SKU-002', 500)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO stock (sku, quantity) VALUES ('SKU-003', 100)
ON CONFLICT (sku) DO NOTHING;
