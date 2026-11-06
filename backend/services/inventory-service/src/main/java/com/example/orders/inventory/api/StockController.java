package com.example.orders.inventory.api;

import com.example.orders.inventory.domain.Stock;
import com.example.orders.inventory.domain.StockRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/stock")
public class StockController {

    private final StockRepository stockRepository;
    private final StockService stockService;

    public StockController(StockRepository stockRepository, StockService stockService) {
        this.stockRepository = stockRepository;
        this.stockService = stockService;
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

    /** Lab 4 — create; returns 201. Body of {@link StockService#create} is yours to implement. */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(operationId = "createStock")
    public StockResponse create(@Valid @RequestBody CreateStockRequest request) {
        return stockService.create(request);
    }

    /** Lab 4 — update quantity. Body of {@link StockService#update} is yours to implement. */
    @PutMapping("/{sku}")
    @Operation(operationId = "updateStock")
    public StockResponse update(
            @PathVariable String sku, @Valid @RequestBody UpdateStockRequest request) {
        return stockService.update(sku, request);
    }

    /** Lab 4 — delete; returns 204. Body of {@link StockService#delete} is yours to implement. */
    @DeleteMapping("/{sku}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(operationId = "deleteStock")
    public void delete(@PathVariable String sku) {
        stockService.delete(sku);
    }

    @Schema(requiredProperties = {"sku", "quantity"})
    public record StockResponse(String sku, int quantity) {
        public static StockResponse from(Stock stock) {
            return new StockResponse(stock.getSku(), stock.getQuantity());
        }
    }
}
