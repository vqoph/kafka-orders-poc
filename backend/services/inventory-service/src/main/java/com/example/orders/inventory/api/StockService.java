package com.example.orders.inventory.api;

import com.example.orders.inventory.api.StockController.StockResponse;
import com.example.orders.inventory.domain.Stock;
import com.example.orders.inventory.domain.StockRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * Stock catalog write use-cases. GET list/by-sku stay on {@link StockController}.
 * See doc/fr/appendices/exercises/lab-04-stock-payment-rest.md
 */
@Service
public class StockService {

    private final StockRepository stockRepository;

    public StockService(StockRepository stockRepository) {
        this.stockRepository = stockRepository;
    }

    /** Creates a stock row; 409 if the SKU already exists. */
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

    /** Updates quantity for an existing SKU; 404 if unknown. */
    @Transactional
    public StockResponse update(String sku, UpdateStockRequest request) {
        Stock stock = stockRepository.findById(sku)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Stock with SKU " + sku + " not found"));
        stock.setQuantity(request.quantity());
        stockRepository.save(stock);
        return StockResponse.from(stock);
    }

    /** Deletes a stock row; 404 if unknown. */
    @Transactional
    public void delete(String sku) {
        if (!stockRepository.existsById(sku)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Stock with SKU " + sku + " not found");
        }
        stockRepository.deleteById(sku);
    }
}
