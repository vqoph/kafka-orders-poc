package com.example.orders.inventory;

import com.example.orders.events.OrderCreated;
import com.example.orders.events.OrderItemData;
import com.example.orders.inventory.domain.Reservation;
import com.example.orders.inventory.domain.ReservationItem;
import com.example.orders.inventory.domain.ReservationRepository;
import com.example.orders.inventory.domain.Stock;
import com.example.orders.inventory.domain.StockRepository;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.logging.Logger;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Stock reservation rule for an {@link OrderCreated} event.
 * Failure rate is mutable at runtime via chaos API.
 * See doc/fr/appendices/exercises/lab-03-saga-choreography.md
 */
@Component
public class InventoryReservation {

    private final StockRepository stockRepository;
    private final ReservationRepository reservationRepository;
    private volatile double failureRate;
    private final Logger log = Logger.getLogger(InventoryReservation.class.getName());

    public InventoryReservation(
            StockRepository stockRepository,
            ReservationRepository reservationRepository,
            @Value("${inventory.failure-rate}") double failureRate) {
        this.stockRepository = stockRepository;
        this.reservationRepository = reservationRepository;
        this.failureRate = failureRate;
    }

    /**
     * Reserves stock for each line item, or records a failed reservation when stock
     * is insufficient or chaos failure applies.
     */
    public Reservation reserve(OrderCreated order) {
        if (failureRate > 0 && Math.random() < failureRate) {
            return failReservation(order, "Inventory reservation failed");
        }

        // Defense in depth: merge qty by SKU
        Map<String, Integer> qtyBySku = order.items().stream()
                .collect(Collectors.toMap(
                        OrderItemData::sku,
                        OrderItemData::quantity,
                        Integer::sum));

        Map<String, Stock> stocks = stockRepository.findAllById(qtyBySku.keySet()).stream()
                .collect(Collectors.toMap(Stock::getSku, Function.identity()));

        List<ReservationItem> items = new ArrayList<>();
        for (Map.Entry<String, Integer> entry : qtyBySku.entrySet()) {
            String sku = entry.getKey();
            Stock stock = stocks.get(sku);
            int quantity = entry.getValue();
            if (stock == null) {
                return failReservation(order, "Unknown SKU: " + sku);
            }
            if (stock.getQuantity() < quantity) {
                return failReservation(order, "Insufficient stock for SKU: " + sku);
            }
            items.add(new ReservationItem(sku, quantity));
        }

        for (ReservationItem item : items) {
            Stock stock = stocks.get(item.getSku());
            stock.decrement(item.getQuantity());
            stockRepository.save(stock);
        }

        // Save the reservation
        Reservation reservation = new Reservation(order.orderId(), true, items);
        reservationRepository.save(reservation);

        return reservation;
    }

    public double getFailureRate() {
        return failureRate;
    }

    public void setFailureRate(double failureRate) {
        if (failureRate < 0.0 || failureRate > 1.0) {
            throw new IllegalArgumentException("failure rate must be between 0.0 and 1.0");
        }
        this.failureRate = failureRate;
    }

    private Reservation failReservation(OrderCreated order, String failureReason) {
        Reservation reservation = new Reservation(
                order.orderId(),
                false,
                Collections.emptyList(),
                failureReason);
        reservationRepository.save(reservation);
        log.info("Failed reservation for orderId=" + order.orderId() + " reason=" + failureReason);
        return reservation;
    }
}
