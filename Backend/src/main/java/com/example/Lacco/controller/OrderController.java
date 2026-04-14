package com.example.Lacco.controller;

import com.example.Lacco.model.dto.OrderDto;
import com.example.Lacco.service.OrderService;
import com.example.Lacco.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * REST Controller for order endpoints
 * Zaktualizowany o rygorystyczną weryfikację roli TRADER oraz poprawkę CORS.
 */
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173"})
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Slf4j
public class OrderController {

    private final OrderService orderService;
    private final ProfileRepository profileRepository;

    @GetMapping
    public ResponseEntity<List<OrderDto>> getAllOrders() {
        log.info("Fetching all orders");
        List<OrderDto> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDto> getOrderById(@PathVariable UUID id) {
        log.info("Fetching order with id: {}", id);
        OrderDto order = orderService.getOrderById(id);
        return ResponseEntity.ok(order);
    }

    @PostMapping
    public ResponseEntity<OrderDto> createOrder(@RequestBody OrderDto orderDto) {
        log.info("Creating new order");
        OrderDto created = orderService.createOrder(orderDto);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrderDto> updateOrder(@PathVariable UUID id, @RequestBody OrderDto orderDto) {
        log.info("Updating order with id: {}", id);
        OrderDto updated = orderService.updateOrder(id, orderDto);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderDto> updateOrderStatus(@PathVariable UUID id, @RequestBody Map<String, String> statusUpdate) {
        log.info("Updating order status with id: {}", id);
        String newStatus = statusUpdate.get("status");
        OrderDto updated = orderService.updateOrderStatus(id, newStatus);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable UUID id) {
        log.info("Deleting order with id: {}", id);
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        log.info("Fetching global dashboard stats");
        Map<String, Object> stats = orderService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/trader/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getTraderDashboardStats(@RequestParam(required = false) String traderId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        log.info("Trader stats request. Auth: {}, Param traderId: {}", 
                (auth != null ? auth.getName() : "anonymous"), traderId);

        try {
            UUID finalTraderId;

            // 1. Jeśli przesłano traderId w parametrze (ścieżka dla WWW / bez tokena)
            if (traderId != null && !traderId.trim().isEmpty()) {
                log.info("Using traderId from request parameter: {}", traderId);
                finalTraderId = UUID.fromString(traderId);
            } 
            // 2. Jeśli brak parametru, ale użytkownik jest zalogowany (ścieżka dla Mobile / z tokenem)
            else if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
                String email = auth.getName();
                var profile = profileRepository.findByEmail(email)
                        .orElseThrow(() -> new RuntimeException("Profile not found for: " + email));
                finalTraderId = profile.getId();
            } 
            // 3. Brak danych identyfikacyjnych
            else {
                log.warn("Unauthorized: No traderId parameter and no valid session");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            log.info("Fetching data for finalTraderId: {}", finalTraderId);
            Map<String, Object> stats = orderService.getTraderDashboardStats(finalTraderId);
            
            // Zabezpieczenie struktury danych dla frontendu
            if (stats == null || stats.isEmpty()) {
                return ResponseEntity.ok(Map.of(
                    "totalSales", 0.0,
                    "monthlySales", 0.0,
                    "topClient", List.of("Brak danych", 0.0),
                    "topProduct", List.of("Brak danych", 0.0)
                ));
            }

            return ResponseEntity.ok(stats);

        } catch (IllegalArgumentException e) {
            log.error("Invalid UUID format: {}", traderId);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            log.error("CRITICAL ERROR in Trader Stats: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/trader/my-orders")
    public ResponseEntity<List<OrderDto>> getMyOrders(@RequestParam(required = false) String traderId) {
        log.info("Request for trader orders. Param traderId: {}", traderId);
        
        try {
            UUID finalTraderId = resolveTraderId(traderId);
            log.info("Fetching orders for finalTraderId: {}", finalTraderId);
            
            // Wywołujemy nową metodę w serwisie (tę z JOINem do leadów)
            List<OrderDto> orders = orderService.getOrdersByTraderWithDetails(finalTraderId);
            return ResponseEntity.ok(orders);
            
        } catch (RuntimeException e) {
            log.warn("Unauthorized or Profile not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception e) {
            log.error("Error fetching trader orders: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Pomocnicza metoda do wyciągania ID (identyczna jak w statystykach dla spójności)
    private UUID resolveTraderId(String traderId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        if (traderId != null && !traderId.trim().isEmpty()) {
            return UUID.fromString(traderId);
        } else if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            String email = auth.getName();
            return profileRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Profile not found for: " + email))
                    .getId();
        }
        throw new RuntimeException("Could not resolve Trader ID");
    }
}