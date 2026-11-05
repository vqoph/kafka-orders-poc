package com.example.orders.notification.api;

import io.swagger.v3.oas.annotations.Operation;
import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CopyOnWriteArrayList;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/**
 * Front-ready stubs for notification timeline / SSE.
 * Empty history and keep-alive stream until Kafka wiring (tutorial étape 8) is done.
 */
@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    @GetMapping(path = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(operationId = "streamNotifications", hidden = true)
    public SseEmitter stream() {
        SseEmitter emitter = new SseEmitter(0L);
        emitters.add(emitter);
        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        emitter.onError(ex -> emitters.remove(emitter));
        try {
            emitter.send(SseEmitter.event()
                    .name("connected")
                    .data(new NotificationEvent(
                            null,
                            "CONNECTED",
                            "SSE stub ready",
                            Instant.now())));
        } catch (IOException ex) {
            emitters.remove(emitter);
            emitter.completeWithError(ex);
        }
        return emitter;
    }

    @GetMapping
    @Operation(operationId = "listNotifications")
    public List<NotificationEvent> list(@RequestParam(required = false) UUID orderId) {
        // Stub: no persisted notifications yet.
        return List.of();
    }

    public record NotificationEvent(
            UUID orderId,
            String type,
            String message,
            Instant at) {
    }
}
