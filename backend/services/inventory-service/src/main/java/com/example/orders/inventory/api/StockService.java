package com.example.orders.inventory.api;

import com.example.orders.inventory.api.StockController.StockResponse;
import com.example.orders.inventory.domain.Stock;
import com.example.orders.inventory.domain.StockRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * Stock catalog use-cases (Lab 4). GET list/by-sku stay on
 * {@link StockController};
 * you implement create / update / delete here — search {@code TODO Lab 4}.
 */
@Service
public class StockService {

    private final StockRepository stockRepository;

    public StockService(StockRepository stockRepository) {
        this.stockRepository = stockRepository;
    }

    /*
     * ## Create a stock row
     *
     * - If `sku` already exists → `409 CONFLICT`
     * - Else save `new Stock(sku, quantity)` → return `StockResponse.from(...)`
     */
    @Transactional
    public StockResponse create(CreateStockRequest request) {
        if (stockRepository.existsById(request.sku())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Stock with SKU " + request.sku() + " already exists");
        }
        Stock stock = new Stock(request.sku(), request.quantity());
        stockRepository.save(stock);
        return StockResponse.from(stock);
    }

    /*
     * ## Update quantity for an existing SKU
     *
     * - Unknown sku → `404 NOT_FOUND`
     * - Else `stock.setQuantity(...)` + save → return response
     */
    @Transactional
    public StockResponse update(String sku, UpdateStockRequest request) {
        Stock stock = stockRepository.findById(sku)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Stock with SKU " + sku + " not found"));
        stock.setQuantity(request.quantity());
        stockRepository.save(stock);
        return StockResponse.from(stock);
    }

    /*
     * ## Delete a stock row
     *
     * - Unknown sku → `404 NOT_FOUND`
     * - Else delete → void (`204` from controller)
     */
    @Transactional
    public void delete(String sku) {
        if (!stockRepository.existsById(sku)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Stock with SKU " + sku + " not found");
        }
        stockRepository.deleteById(sku);
    }
}
