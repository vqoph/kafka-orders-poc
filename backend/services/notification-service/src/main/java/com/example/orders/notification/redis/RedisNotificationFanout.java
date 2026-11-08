package com.example.orders.notification.redis;

import com.example.orders.notification.api.NotificationEvent;
import com.example.orders.notification.sse.SseHub;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.json.JsonMapper;

/**
 * Cross-instance SSE fan-out via Redis Pub/Sub.
 * Kafka listeners {@link #publish(NotificationEvent)}; every pod's subscriber
 * calls {@link SseHub#broadcast(NotificationEvent)} for local emitters only.
 */
@Component
public class RedisNotificationFanout implements MessageListener {

    public static final String CHANNEL = "notifications.sse";

    private static final Logger log = LoggerFactory.getLogger(RedisNotificationFanout.class);

    private final StringRedisTemplate redisTemplate;
    private final JsonMapper jsonMapper;
    private final SseHub sseHub;

    public RedisNotificationFanout(
            StringRedisTemplate redisTemplate,
            JsonMapper jsonMapper,
            SseHub sseHub) {
        this.redisTemplate = redisTemplate;
        this.jsonMapper = jsonMapper;
        this.sseHub = sseHub;
    }

    /** Called by Kafka listeners — one publish reaches every subscribed JVM. */
    public void publish(NotificationEvent event) {
        try {
            redisTemplate.convertAndSend(CHANNEL, jsonMapper.writeValueAsString(event));
        } catch (JacksonException ex) {
            throw new IllegalStateException("Failed to serialize NotificationEvent for Redis", ex);
        }
    }

    @Override
    public void onMessage(Message message, byte[] pattern) {
        String body = new String(message.getBody());
        try {
            NotificationEvent event = jsonMapper.readValue(body, NotificationEvent.class);
            sseHub.broadcast(event);
        } catch (JacksonException ex) {
            log.warn("Ignoring malformed Redis notification payload: {}", body, ex);
        }
    }
}
