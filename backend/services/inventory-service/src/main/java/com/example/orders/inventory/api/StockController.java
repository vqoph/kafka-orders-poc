package com.example.orders.inventory.api;

import com.example.orders.inventory.domain.Stock;
import com.example.orders.inventory.domain.StockRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/stock")
public class StockController {

    private final StockRepository stockRepository;

    public StockController(StockRepository stockRepository) {
        this.stockRepository = stockRepository;
    }

    @GetMapping
    @Operation(operationId = "listStock")
    public List<StockResponse> list() {
        return stockRepository.findAll().stream()
                .map(StockResponse::from)
                .toList();
    }

    @GetMapping("/{sku}")
    @Operation(operationId = "getStock")
    public StockResponse getBySku(@PathVariable String sku) {
        Stock stock = stockRepository.findById(sku)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "SKU not found: " + sku));
        return StockResponse.from(stock);
    }

    @Schema(requiredProperties = {"sku", "quantity"})
    public record StockResponse(String sku, int quantity) {
        public static StockResponse from(Stock stock) {
            return new StockResponse(stock.getSku(), stock.getQuantity());
        }
    }
}
