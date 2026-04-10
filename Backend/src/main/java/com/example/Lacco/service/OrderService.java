package com.example.Lacco.service;

import com.example.Lacco.model.dto.OrderDto;
import com.example.Lacco.model.dto.OrderItemDto;
import com.example.Lacco.model.entity.*;
import com.example.Lacco.repository.CustomerRepository;
import com.example.Lacco.repository.OrderItemRepository;
import com.example.Lacco.repository.OrderRepository;
import com.example.Lacco.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service do obsługi zamówień i statystyk dashboardu.
 * Zaktualizowano logowanie i odporność na brak uprawnień/danych.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CustomerRepository customerRepository;
    private final ProfileRepository profileRepository;

    public List<OrderDto> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public OrderDto getOrderById(UUID id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono zamówienia"));
        return toDto(order);
    }

    @Transactional
    public OrderDto createOrder(OrderDto orderDto) {
        Integer numerZamowienia = orderDto.numerZamowienia();
        if (numerZamowienia == null) {
            numerZamowienia = getNextOrderNumber();
        }

        Order order = Order.builder()
                .numerZamowienia(numerZamowienia)
                .klientId(orderDto.klientId())
                .status(orderDto.status())
                .sumaBrutto(orderDto.sumaBrutto())
                .uwagi(orderDto.uwagi())
                .createdAt(OffsetDateTime.now())
                .handlowiecId(orderDto.handlowiecId())
                .sumaNetto(orderDto.sumaNetto())
                .build();

        if (orderDto.orderItems() != null) {
            List<OrderItem> items = orderDto.orderItems().stream()
                    .map(itemDto -> toOrderItemEntity(itemDto, order))
                    .collect(Collectors.toList());
            order.setOrderItems(items);
        }

        Order saved = orderRepository.save(order);
        return toDto(saved);
    }

    @Transactional
    public OrderDto updateOrder(UUID id, OrderDto orderDto) {
        Order existing = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono zamówienia"));

        existing.setNumerZamowienia(orderDto.numerZamowienia());
        existing.setKlientId(orderDto.klientId());
        existing.setStatus(orderDto.status());
        existing.setSumaBrutto(orderDto.sumaBrutto());
        existing.setUwagi(orderDto.uwagi());
        existing.setHandlowiecId(orderDto.handlowiecId());
        existing.setSumaNetto(orderDto.sumaNetto());

        if (orderDto.orderItems() != null) {
            orderItemRepository.findByOrderId(id).forEach(orderItemRepository::delete);
            List<OrderItem> newItems = orderDto.orderItems().stream()
                    .map(itemDto -> toOrderItemEntity(itemDto, existing))
                    .collect(Collectors.toList());
            existing.setOrderItems(newItems);
        }

        Order saved = orderRepository.save(existing);
        return toDto(saved);
    }

    @Transactional
    public OrderDto updateOrderStatus(UUID id, String newStatus) {
        Order existing = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono zamówienia"));
        existing.setStatus(newStatus);
        return toDto(orderRepository.save(existing));
    }

    public void deleteOrder(UUID id) {
        if (!orderRepository.existsById(id)) {
            throw new RuntimeException("Nie znaleziono zamówienia");
        }
        orderRepository.deleteById(id);
    }

    public Map<String, Object> getDashboardStats() {
        YearMonth currentMonth = YearMonth.now();
        OffsetDateTime startOfMonth = currentMonth.atDay(1).atStartOfDay().atOffset(OffsetDateTime.now().getOffset());
        OffsetDateTime endOfMonth = currentMonth.atEndOfMonth().atTime(23, 59, 59).atOffset(OffsetDateTime.now().getOffset());

        BigDecimal monthlySales = orderRepository.getTotalSalesInMonth(startOfMonth, endOfMonth);
        BigDecimal monthlyWeight = orderRepository.getTotalWeightInMonth(startOfMonth, endOfMonth);

        List<Object[]> salesmanSales = orderRepository.getSalesmanTotalSales();
        List<Object[]> salesmanMonthlySales = orderRepository.getSalesmanSalesInMonth(startOfMonth, endOfMonth);

        Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("monthlySales", monthlySales != null ? monthlySales : BigDecimal.ZERO);
        stats.put("monthlyWeight", monthlyWeight != null ? monthlyWeight : BigDecimal.ZERO);
        stats.put("topSalesmanOverall", salesmanSales.isEmpty() ? null : salesmanSales.get(0));
        stats.put("topSalesmanMonthly", salesmanMonthlySales.isEmpty() ? null : salesmanMonthlySales.get(0));
        stats.put("newOrdersCount", orderRepository.findByStatus("NEW").size());
        stats.put("inProgressOrdersCount", orderRepository.findByStatus("IN_PROGRESS").size());

        return stats;
    }

    /**
     * Zaktualizowana metoda statystyk handlowca.
     * Dodano logowanie DEBUG dla weryfikacji danych bez Security.
     */
    public Map<String, Object> getTraderDashboardStats(UUID handlowiecId) {
        log.info("!!! POBIERANIE STATYSTYK DLA HANDLOWCA: {} !!!", handlowiecId);
        
        YearMonth currentMonth = YearMonth.now();
        OffsetDateTime startOfMonth = currentMonth.atDay(1).atStartOfDay().atOffset(OffsetDateTime.now().getOffset());
        OffsetDateTime endOfMonth = currentMonth.atEndOfMonth().atTime(23, 59, 59).atOffset(OffsetDateTime.now().getOffset());

        BigDecimal totalSales = orderRepository.getTotalSalesForTrader(handlowiecId);
        BigDecimal monthlySales = orderRepository.getMonthlySalesForTrader(handlowiecId, startOfMonth, endOfMonth);

        List<Object[]> topClient = orderRepository.getTopClientForTrader(handlowiecId);
        List<Object[]> topProduct = orderRepository.getTopProductForTrader(handlowiecId);

        Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("totalSales", totalSales != null ? totalSales : BigDecimal.ZERO);
        stats.put("monthlySales", monthlySales != null ? monthlySales : BigDecimal.ZERO);
        
        // Bezpieczne sprawdzanie list (zapobiega p1_0 index errors)
        stats.put("topClient", (topClient == null || topClient.isEmpty()) ? null : topClient.get(0));
        stats.put("topProduct", (topProduct == null || topProduct.isEmpty()) ? null : topProduct.get(0));

        log.info("Statystyki obliczone pomyślnie dla handlowca {}", handlowiecId);
        return stats;
    }

    private OrderDto toDto(Order order) {
        List<OrderItemDto> items = order.getOrderItems().stream()
                .map(this::toOrderItemDto)
                .collect(Collectors.toList());

        return new OrderDto(
                order.getId(),
                order.getNumerZamowienia(),
                order.getKlientId(),
                order.getStatus(),
                order.getSumaBrutto(),
                order.getUwagi(),
                order.getCreatedAt(),
                order.getHandlowiecId(),
                order.getSumaNetto(),
                items
        );
    }

    private OrderItemDto toOrderItemDto(OrderItem item) {
        return new OrderItemDto(
                item.getId(),
                item.getProduktId(),
                item.getIlosc(),
                item.getCenaZastosowana(),
                item.getCreatedAt(),
                item.getWartoscNetto(),
                item.getNazwa(),
                item.getOpakowanie(),
                item.getKolorId()
        );
    }

    private Integer getNextOrderNumber() {
        Integer maxNumber = orderRepository.findMaxOrderNumber();
        return (maxNumber != null ? maxNumber : 0) + 1;
    }

    private OrderItem toOrderItemEntity(OrderItemDto dto, Order order) {
        return OrderItem.builder()
                .order(order)
                .produktId(dto.produktId())
                .ilosc(dto.ilosc())
                .cenaZastosowana(dto.cenaZastosowana())
                .createdAt(dto.createdAt() != null ? dto.createdAt() : OffsetDateTime.now())
                .wartoscNetto(dto.wartoscNetto())
                .nazwa(dto.nazwa())
                .opakowanie(dto.opakowanie())
                .kolorId(dto.kolorId())
                .build();
    }
}