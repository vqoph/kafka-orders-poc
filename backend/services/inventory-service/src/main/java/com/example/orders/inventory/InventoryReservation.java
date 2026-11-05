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
            Stock stock = stocks.get(entry.getKey());
            int quantity = entry.getValue();
            if (stock == null || stock.getQuantity() < quantity) {
                return failReservation(order);
            }
            items.add(new ReservationItem(entry.getKey(), quantity));
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

    private Reservation failReservation(OrderCreated order) {
        Reservation reservation = new Reservation(order.orderId(), false, Collections.emptyList());
        reservationRepository.save(reservation);
        log.info("Failed reservation for orderId=" + order.orderId());
        return reservation;
    }
}
