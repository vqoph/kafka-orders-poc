package com.example.orders.notification.api;

import com.example.orders.notification.sse.SseHub;
import io.swagger.v3.oas.annotations.Operation;
import java.io.IOException;
import java.time.Instant;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/**
 * SSE stream for the UI.
 * Domain events reach the hub via Kafka listeners — not via HTTP publish.
 * See doc/fr/appendices/exercises/lab-05-notification-sse.md
 */
@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final SseHub sseHub;

    public NotificationController(SseHub sseHub) {
        this.sseHub = sseHub;
    }

    @GetMapping(path = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(operationId = "streamNotifications", hidden = true)
    public SseEmitter stream() {
        SseEmitter emitter = sseHub.register();
        try {
            emitter.send(SseEmitter.event()
                    .name("connected")
                    .data(new NotificationEvent(
                            null,
                            NotificationEvent.TYPE_CONNECTED,
                            "SSE stub ready",
                            null,
                            Instant.now())));
        } catch (IOException ex) {
            emitter.completeWithError(ex);
        }
        return emitter;
    }
}
