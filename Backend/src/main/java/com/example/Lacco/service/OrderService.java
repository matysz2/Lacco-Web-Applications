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
 * Service for handling order operations
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
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return toDto(order);
    }

    @Transactional
    public OrderDto createOrder(OrderDto orderDto) {
        Order order = Order.builder()
                .id(UUID.randomUUID())
                .numerZamowienia(orderDto.numerZamowienia())
                .klientId(orderDto.klientId())
                .status(orderDto.status())
                .sumaBrutto(orderDto.sumaBrutto())
                .uwagi(orderDto.uwagi())
                .createdAt(OffsetDateTime.now())
                .handlowiecId(orderDto.handlowiecId())
                .sumaNetto(orderDto.sumaNetto())
                .build();

        Order saved = orderRepository.save(order);

        // Save order items
        if (orderDto.orderItems() != null) {
            for (OrderItemDto itemDto : orderDto.orderItems()) {
                OrderItem item = toOrderItemEntity(itemDto, saved);
                orderItemRepository.save(item);
            }
        }

        return toDto(saved);
    }

    @Transactional
    public OrderDto updateOrder(UUID id, OrderDto orderDto) {
        Order existing = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        existing.setNumerZamowienia(orderDto.numerZamowienia());
        existing.setKlientId(orderDto.klientId());
        existing.setStatus(orderDto.status());
        existing.setSumaBrutto(orderDto.sumaBrutto());
        existing.setUwagi(orderDto.uwagi());
        existing.setHandlowiecId(orderDto.handlowiecId());
        existing.setSumaNetto(orderDto.sumaNetto());

        Order saved = orderRepository.save(existing);

        // Update order items if provided
        if (orderDto.orderItems() != null) {
            // Delete existing items
            orderItemRepository.findByOrderId(id).forEach(item -> orderItemRepository.delete(item));
            // Save new items
            for (OrderItemDto itemDto : orderDto.orderItems()) {
                OrderItem item = toOrderItemEntity(itemDto, saved);
                orderItemRepository.save(item);
            }
        }

        return toDto(saved);
    }

    public void deleteOrder(UUID id) {
        if (!orderRepository.existsById(id)) {
            throw new RuntimeException("Order not found");
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

        long newOrders = orderRepository.findByStatus("NEW").size();
        long inProgressOrders = orderRepository.findByStatus("IN_PROGRESS").size();

        Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("monthlySales", monthlySales != null ? monthlySales : BigDecimal.ZERO);
        stats.put("monthlyWeight", monthlyWeight != null ? monthlyWeight : BigDecimal.ZERO);
        stats.put("topSalesmanOverall", salesmanSales.isEmpty() ? java.util.Collections.emptyList() : salesmanSales.get(0));
        stats.put("topSalesmanMonthly", salesmanMonthlySales.isEmpty() ? java.util.Collections.emptyList() : salesmanMonthlySales.get(0));
        stats.put("newOrdersCount", newOrders);
        stats.put("inProgressOrdersCount", inProgressOrders);

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

    private OrderItem toOrderItemEntity(OrderItemDto dto, Order order) {
        return OrderItem.builder()
                .id(UUID.randomUUID())
                .order(order)
                .produktId(dto.produktId())
                .ilosc(dto.ilosc())
                .cenaZastosowana(dto.cenaZastosowana())
                .createdAt(dto.createdAt())
                .wartoscNetto(dto.wartoscNetto())
                .nazwa(dto.nazwa())
                .opakowanie(dto.opakowanie())
                .kolorId(dto.kolorId())
                .build();
    }
}