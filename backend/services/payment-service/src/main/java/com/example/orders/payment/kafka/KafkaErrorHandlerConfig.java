package com.example.orders.payment.kafka;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.listener.CommonErrorHandler;
import org.springframework.kafka.listener.DeadLetterPublishingRecoverer;
import org.springframework.kafka.listener.DefaultErrorHandler;
import org.springframework.util.backoff.FixedBackOff;

/**
 * After retries with backoff, failed records go to {@code orders.created.DLT}.
 */
@Configuration
public class KafkaErrorHandlerConfig {

    @Bean
    CommonErrorHandler paymentKafkaErrorHandler(KafkaTemplate<String, Object> kafkaTemplate) {
        DeadLetterPublishingRecoverer recoverer = new DeadLetterPublishingRecoverer(kafkaTemplate);
        // 1s between attempts, 3 retries after the first failure.
        return new DefaultErrorHandler(recoverer, new FixedBackOff(1_000L, 3L));
    }
}
