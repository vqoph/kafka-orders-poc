package com.example.orders.inventory.api;

import com.example.orders.inventory.domain.StockRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Stock catalog use-cases (Lab 4). GET list/by-sku stay on {@link StockController};
 * you implement create / update / delete here — search {@code TODO Lab 4}.
 */
@Service
public class StockService {

    private final StockRepository stockRepository;

    public StockService(StockRepository stockRepository) {
        this.stockRepository = stockRepository;
    }

    /**
     * Create a stock row.
     * <ul>
     *   <li>If {@code sku} already exists → {@code 409 CONFLICT}</li>
     *   <li>Else save {@code new Stock(sku, quantity)} → return {@link StockController.StockResponse}</li>
     * </ul>
     */
    @Transactional
    public StockController.StockResponse create(CreateStockRequest request) {
        // TODO Lab 4: implement create (409 if sku exists, else save + return StockResponse.from)
        throw new UnsupportedOperationException("TODO Lab 4");
    }

    /**
     * Update quantity for an existing SKU.
     * <ul>
     *   <li>Unknown sku → {@code 404 NOT_FOUND}</li>
     *   <li>Else {@code stock.setQuantity(...)} + save → return response</li>
     * </ul>
     */
    @Transactional
    public StockController.StockResponse update(String sku, UpdateStockRequest request) {
        // TODO Lab 4: implement update (404 if missing, else setQuantity + save)
        throw new UnsupportedOperationException("TODO Lab 4");
    }

    /**
     * Delete a stock row.
     * <ul>
     *   <li>Unknown sku → {@code 404 NOT_FOUND}</li>
     *   <li>Else delete → void ({@code 204} from controller)</li>
     * </ul>
     */
    @Transactional
    public void delete(String sku) {
        // TODO Lab 4: implement delete (404 if missing, else deleteById)
        throw new UnsupportedOperationException("TODO Lab 4");
    }
}
