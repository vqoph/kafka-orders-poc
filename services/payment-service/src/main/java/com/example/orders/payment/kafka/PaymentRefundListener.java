package com.example.orders.payment.kafka;

import com.example.orders.events.PaymentRefundRequested;
import com.example.orders.payment.PaymentRefundService;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class PaymentRefundListener {

    private final PaymentRefundService paymentRefundService;

    public PaymentRefundListener(PaymentRefundService paymentRefundService) {
        this.paymentRefundService = paymentRefundService;
    }

    @KafkaListener(topics = KafkaTopics.PAYMENTS_REFUND_REQUESTED, groupId = "payment-service")
    public void onRefundRequested(PaymentRefundRequested event) {
        paymentRefundService.processRefundRequested(event);
    }
}
