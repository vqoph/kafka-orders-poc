package com.example.orders.payment.api;

import com.example.orders.payment.domain.Payment;
import com.example.orders.payment.domain.PaymentRepository;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * Payment read use-cases (Lab 4). Search {@code TODO Lab 4}.
 * Mirror {@code OrderService#findAll} / {@code findById}.
 * Named differently from {@link com.example.orders.payment.PaymentService}
 * (Kafka processing).
 */
@Service
public class PaymentQueryService {

    private final PaymentRepository paymentRepository;

    public PaymentQueryService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    /**
     * Paginated list —
     * {@code paymentRepository.findAll(pageable).map(PaymentResponse::from)}.
     */
    @Transactional(readOnly = true)
    public Page<PaymentResponse> findAll(Pageable pageable) {
        return paymentRepository.findAll(pageable).map(PaymentResponse::from);
    }

    /**
     * By id — 404 via {@code ResponseStatusException} if missing, else
     * {@code PaymentResponse.from}.
     */
    @Transactional(readOnly = true)
    public PaymentResponse findById(UUID id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Payment with ID " + id + " not found"));
        return PaymentResponse.from(payment);
    }
}
