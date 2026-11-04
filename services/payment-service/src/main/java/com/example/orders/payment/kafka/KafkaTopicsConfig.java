package com.example.orders.payment.kafka;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopicsConfig {

    /** Declares payments.processed only — orders.created already exists (order-service). */
    @Bean
    NewTopic paymentsProcessedTopic() {
        return TopicBuilder.name(KafkaTopics.PAYMENTS_PROCESSED)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    NewTopic paymentsRefundRequestedTopic() {
        return TopicBuilder.name(KafkaTopics.PAYMENTS_REFUND_REQUESTED)
                .partitions(3)
                .replicas(1)
                .build();
    }
}
