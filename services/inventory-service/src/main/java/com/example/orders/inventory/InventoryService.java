package com.example.orders.inventory;

import com.example.orders.events.InventoryReleaseRequested;
import com.example.orders.events.OrderCreated;
import com.example.orders.inventory.domain.Reservation;
import com.example.orders.inventory.domain.ReservationItem;
import com.example.orders.inventory.domain.ReservationRepository;
import com.example.orders.inventory.domain.Stock;
import com.example.orders.inventory.domain.StockRepository;
import com.example.orders.inventory.kafka.InventoryEventPublisher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InventoryService {

    private static final Logger log = LoggerFactory.getLogger(InventoryService.class);

    private final InventoryReservation inventoryReservation;
    private final ReservationRepository reservationRepository;
    private final StockRepository stockRepository;
    private final InventoryEventPublisher inventoryEventPublisher;

    public InventoryService(
            InventoryReservation inventoryReservation,
            ReservationRepository reservationRepository,
            StockRepository stockRepository,
            InventoryEventPublisher inventoryEventPublisher
    ) {
        this.inventoryReservation = inventoryReservation;
        this.reservationRepository = reservationRepository;
        this.stockRepository = stockRepository;
        this.inventoryEventPublisher = inventoryEventPublisher;
    }

    @Transactional
    public void processOrderCreated(OrderCreated order) {
        Reservation reservation = inventoryReservation.reserve(order);
        inventoryEventPublisher.publishReserved(reservation);
        log.info(
                "Processed inventory orderId={} success={}",
                order.orderId(),
                reservation.isSuccess()
        );
    }

    @Transactional
    public void processReleaseRequested(InventoryReleaseRequested event) {
        reservationRepository
                .findFirstByOrderIdAndSuccessTrueOrderByReservedAtDesc(event.orderId())
                .ifPresentOrElse(
                        reservation -> {
                            for (ReservationItem item : reservation.getItems()) {
                                Stock stock = stockRepository.findById(item.getSku()).orElseThrow();
                                stock.increment(item.getQuantity());
                                stockRepository.save(stock);
                            }
                            log.info("Released inventory for orderId={}", event.orderId());
                        },
                        () -> log.warn("No successful reservation to release for orderId={}", event.orderId())
                );
    }
}
