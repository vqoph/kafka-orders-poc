package com.example.orders.notification.sse;

import com.example.orders.notification.api.NotificationEvent;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/**
 * In-memory fan-out for SSE clients on this JVM only.
 * Cross-instance fan-out goes through Redis ({@code RedisNotificationFanout}).
 * See doc/fr/appendices/exercises/lab-05-notification-sse.md
 */
@Component
public class SseHub {

    public static final String EVENT_NAME = "notification";

    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    public SseEmitter register() {
        SseEmitter emitter = new SseEmitter(0L);
        emitters.add(emitter);
        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        emitter.onError(ex -> emitters.remove(emitter));
        return emitter;
    }

    /** Sends the event to every registered emitter; drops failed emitters. */
    public void broadcast(NotificationEvent event) {
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name(EVENT_NAME).data(event));
            } catch (IOException e) {
                emitters.remove(emitter);
                emitter.completeWithError(e);
            }
        }
    }
}
