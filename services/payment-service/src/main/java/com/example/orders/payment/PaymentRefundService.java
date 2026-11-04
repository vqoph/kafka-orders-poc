package com.example.orders.payment;

import com.example.orders.events.PaymentRefundRequested;
import com.example.orders.payment.domain.PaymentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PaymentRefundService {

    private static final Logger log = LoggerFactory.getLogger(PaymentRefundService.class);

    private final PaymentRepository paymentRepository;

    public PaymentRefundService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    @Transactional
    public void processRefundRequested(PaymentRefundRequested event) {
        paymentRepository
                .findFirstByOrderIdAndSuccessTrueOrderByProcessedAtDesc(event.orderId())
                .ifPresentOrElse(
                        payment -> {
                            if (payment.getRefundedAt() != null) {
                                log.info("Payment already refunded orderId={}", event.orderId());
                                return;
                            }
                            payment.markRefunded();
                            log.info("Refunded payment orderId={} amount={}", event.orderId(), event.amount());
                        },
                        () -> log.warn("No successful payment to refund for orderId={}", event.orderId())
                );
    }
}
