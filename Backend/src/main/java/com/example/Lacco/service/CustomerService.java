package com.example.Lacco.service;

import com.example.Lacco.model.dto.CustomerDto;
import com.example.Lacco.model.entity.Customer;
import com.example.Lacco.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for handling customer operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CustomerService {

    private final CustomerRepository customerRepository;

    public List<CustomerDto> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public CustomerDto getCustomerById(UUID id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        return toDto(customer);
    }

    public CustomerDto createCustomer(CustomerDto customerDto) {
        Customer customer = toEntity(customerDto);
        customer.setId(UUID.randomUUID());
        customer.setCreatedAt(OffsetDateTime.now());
        customer.setUpdatedAt(OffsetDateTime.now());
        Customer saved = customerRepository.save(customer);
        return toDto(saved);
    }

    public CustomerDto updateCustomer(UUID id, CustomerDto customerDto) {
        Customer existing = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        existing.setName(customerDto.name());
        existing.setContactInfo(customerDto.contactInfo());
        existing.setAddress(customerDto.address());
        existing.setPhone(customerDto.phone());
        existing.setEmail(customerDto.email());
        existing.setUpdatedAt(OffsetDateTime.now());
        Customer saved = customerRepository.save(existing);
        return toDto(saved);
    }

    public void deleteCustomer(UUID id) {
        if (!customerRepository.existsById(id)) {
            throw new RuntimeException("Customer not found");
        }
        customerRepository.deleteById(id);
    }

    private CustomerDto toDto(Customer customer) {
        return new CustomerDto(
                customer.getId(),
                customer.getName(),
                customer.getContactInfo(),
                customer.getAddress(),
                customer.getPhone(),
                customer.getEmail(),
                customer.getCreatedAt(),
                customer.getUpdatedAt()
        );
    }

    private Customer toEntity(CustomerDto dto) {
        return Customer.builder()
                .id(dto.id())
                .name(dto.name())
                .contactInfo(dto.contactInfo())
                .address(dto.address())
                .phone(dto.phone())
                .email(dto.email())
                .createdAt(dto.createdAt())
                .updatedAt(dto.updatedAt())
                .build();
    }
}