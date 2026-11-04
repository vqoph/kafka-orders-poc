package com.example.orders.inventory.kafka;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopicsConfig {

    @Bean
    NewTopic inventoryReservedTopic() {
        return TopicBuilder.name(KafkaTopics.INVENTORY_RESERVED)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    NewTopic inventoryReleaseRequestedTopic() {
        return TopicBuilder.name(KafkaTopics.INVENTORY_RELEASE_REQUESTED)
                .partitions(3)
                .replicas(1)
                .build();
    }
}
