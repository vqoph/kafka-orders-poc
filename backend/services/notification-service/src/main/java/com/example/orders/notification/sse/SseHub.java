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
 * Lab 5 — implement {@link #broadcast(NotificationEvent)}.
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

    /*
     * ## Lab 5 — broadcast (à coder)
     *
     * For each registered emitter:
     * 1. send an SSE event named {@link #EVENT_NAME} with {@code data = event}
     * 2. on IOException: remove the emitter and {@code completeWithError}
     *
     * Hint: {@code SseEmitter.event().name(EVENT_NAME).data(event)}
     * See doc/fr/appendices/exercises/lab-05-notification-sse.md
     */
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
