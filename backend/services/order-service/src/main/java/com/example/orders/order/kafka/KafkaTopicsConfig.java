package com.example.orders.order.kafka;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopicsConfig {

    /**
     * Declares the topic (auto-create is disabled on the broker). 3 partitions.
     * See doc/fr/appendices/exercises/lab-01-keys-partitions.md
     */
    @Bean
    NewTopic ordersCreatedTopic() {
        return TopicBuilder.name(KafkaTopics.ORDERS_CREATED)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    NewTopic ordersStatusTopic() {
        return TopicBuilder.name(KafkaTopics.ORDERS_STATUS)
                .partitions(3)
                .replicas(1)
                .build();
    }
}
