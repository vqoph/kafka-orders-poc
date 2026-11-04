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
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.logging.Logger;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Lab 3 — stock reservation rule ({@link #reserve(OrderCreated)}).
 */
@Component
public class InventoryReservation {

    private final StockRepository stockRepository;
    private final ReservationRepository reservationRepository;
    private final double failureRate;
    private final Logger log = Logger.getLogger(InventoryReservation.class.getName());

    public InventoryReservation(
            StockRepository stockRepository,
            ReservationRepository reservationRepository,
            @Value("${inventory.failure-rate}") double failureRate) {
        this.stockRepository = stockRepository;
        this.reservationRepository = reservationRepository;
        this.failureRate = failureRate;
    }

    /*
     * ## Lab 3 — reserve stock (à coder)
     *
     * For each OrderCreated item: enough stock? If not → save Reservation(orderId,
     * false, empty)
     * and return. If yes for all: decrement each SKU, save Reservation(orderId,
     * true, items).
     * Optional: if failureRate > 0 && Math.random() < failureRate → fail without
     * decrementing.
     *
     * See doc/fr/appendices/exercises/lab-03-saga-choreography.md (A.1).
     */

    public Reservation reserve(OrderCreated order) {
        // If the failure rate is greater than 0 and the random number is less than the
        // failure rate, return a failed reservation
        if (failureRate > 0 && Math.random() < failureRate) {
            return failReservation(order);
        }

        List<ReservationItem> items = new ArrayList<>();
        // Map of SKU to Stock to avoid multiple calls to the database
        Map<String, Stock> stocks = new HashMap<>();

        // Check if there is enough stock for each item
        for (OrderItemData item : order.items()) {
            Stock stock = stockRepository.findById(item.sku()).orElse(null);
            if (stock != null && stock.getQuantity() >= item.quantity()) {
                stocks.put(stock.getSku(), stock);
                items.add(new ReservationItem(item.sku(), item.quantity()));
            } else {
                // If there is not enough stock for an item, return a failed reservation
                return failReservation(order);
            }
        }

        // Decrement the stock for each item
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

    private Reservation failReservation(OrderCreated order) {
        Reservation reservation = new Reservation(order.orderId(), false, Collections.emptyList());
        reservationRepository.save(reservation);
        log.info("Failed reservation for orderId=" + order.orderId());
        return reservation;
    }
}
