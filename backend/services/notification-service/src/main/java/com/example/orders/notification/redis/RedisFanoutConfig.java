package com.example.orders.notification.redis;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;

/**
 * Subscribes every notification-service instance to {@link RedisNotificationFanout#CHANNEL}.
 */
@Configuration
public class RedisFanoutConfig {

    @Bean
    RedisMessageListenerContainer notificationRedisListenerContainer(
            RedisConnectionFactory connectionFactory,
            RedisNotificationFanout fanout) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        container.addMessageListener(fanout, new ChannelTopic(RedisNotificationFanout.CHANNEL));
        return container;
    }
}
