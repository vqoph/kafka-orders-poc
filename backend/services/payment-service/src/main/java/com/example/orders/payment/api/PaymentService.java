package com.example.orders.payment.api;

import com.example.orders.payment.domain.PaymentRepository;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Payment read use-cases (Lab 4). Search {@code TODO Lab 4}.
 * Mirror {@code OrderService#findAll} / {@code findById}.
 */
@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;

    public PaymentService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    /**
     * Paginated list — {@code paymentRepository.findAll(pageable).map(PaymentResponse::from)}.
     */
    @Transactional(readOnly = true)
    public Page<PaymentResponse> findAll(Pageable pageable) {
        // TODO Lab 4: return paymentRepository.findAll(pageable).map(PaymentResponse::from);
        throw new UnsupportedOperationException("TODO Lab 4");
    }

    /**
     * By id — 404 via {@code ResponseStatusException} if missing, else {@code PaymentResponse.from}.
     */
    @Transactional(readOnly = true)
    public PaymentResponse findById(UUID id) {
        // TODO Lab 4: findById → orElseThrow NOT_FOUND → PaymentResponse.from
        throw new UnsupportedOperationException("TODO Lab 4");
    }
}
