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
        Customer customer = customerRepository.findById(orderDto.customerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        Profile salesman = profileRepository.findById(orderDto.salesmanId())
                .orElseThrow(() -> new RuntimeException("Salesman not found"));

        Order order = Order.builder()
                .id(UUID.randomUUID())
                .customer(customer)
                .salesman(salesman)
                .status(orderDto.status())
                .totalAmount(orderDto.totalAmount())
                .totalWeight(orderDto.totalWeight())
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
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

        if (orderDto.customerId() != null) {
            Customer customer = customerRepository.findById(orderDto.customerId())
                    .orElseThrow(() -> new RuntimeException("Customer not found"));
            existing.setCustomer(customer);
        }

        if (orderDto.salesmanId() != null) {
            Profile salesman = profileRepository.findById(orderDto.salesmanId())
                    .orElseThrow(() -> new RuntimeException("Salesman not found"));
            existing.setSalesman(salesman);
        }

        existing.setStatus(orderDto.status());
        existing.setTotalAmount(orderDto.totalAmount());
        existing.setTotalWeight(orderDto.totalWeight());
        existing.setUpdatedAt(OffsetDateTime.now());

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
        List<OrderItemDto> items = orderItemRepository.findByOrderId(order.getId()).stream()
                .map(this::toOrderItemDto)
                .collect(Collectors.toList());

        return new OrderDto(
                order.getId(),
                order.getCustomer() != null ? order.getCustomer().getId() : null,
                order.getCustomer() != null ? order.getCustomer().getName() : null,
                order.getSalesman() != null ? order.getSalesman().getId() : null,
                order.getSalesman() != null ? (order.getSalesman().getFirstName() + " " + order.getSalesman().getLastName()) : null,
                order.getStatus(),
                order.getTotalAmount(),
                order.getTotalWeight(),
                order.getCreatedAt(),
                order.getUpdatedAt(),
                items
        );
    }

    private OrderItemDto toOrderItemDto(OrderItem item) {
        return new OrderItemDto(
                item.getId(),
                item.getOrder().getId(),
                item.getProduct() != null ? item.getProduct().getId() : null,
                item.getProduct() != null ? item.getProduct().getName() : null,
                item.getQuantity(),
                item.getPricePerUnit(),
                item.getTotalPrice(),
                item.getWeight()
        );
    }

    private OrderItem toOrderItemEntity(OrderItemDto dto, Order order) {
        // Assuming product is fetched separately if needed
        return OrderItem.builder()
                .id(UUID.randomUUID())
                .order(order)
                .quantity(dto.quantity())
                .pricePerUnit(dto.pricePerUnit())
                .totalPrice(dto.totalPrice())
                .weight(dto.weight())
                .build();
    }
}