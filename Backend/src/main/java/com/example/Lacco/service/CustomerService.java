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

    public CustomerDto getCustomerById(Integer id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        return toDto(customer);
    }

    public CustomerDto createCustomer(CustomerDto customerDto) {
        Customer customer = toEntity(customerDto);
        customer.setId(null); // ID jest auto-generowany przez bazę
        Customer saved = customerRepository.save(customer);
        return toDto(saved);
    }

    public CustomerDto updateCustomer(Integer id, CustomerDto customerDto) {
        Customer existing = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        existing.setNazwaFirmy(customerDto.nazwaFirmy());
        existing.setTelefon(customerDto.telefon());
        existing.setAdres(customerDto.adres());
        existing.setRegion(customerDto.region());
        existing.setHandlowiec(customerDto.handlowiec());
        existing.setDataPozyskania(customerDto.dataPozyskania());
        existing.setCzyOdwiedzony(customerDto.czyOdwiedzony());
        existing.setStatusWizyty(customerDto.statusWizyty());
        existing.setOpisNotatki(customerDto.opisNotatki());
        existing.setDataOstatniejEdycji(OffsetDateTime.now());
        existing.setNawigacja(customerDto.nawigacja());
        existing.setStronaWww(customerDto.stronaWww());
        existing.setGrupaCenowa(customerDto.grupaCenowa());
        existing.setOstatniaWizyta(customerDto.ostatniaWizyta());
        Customer saved = customerRepository.save(existing);
        return toDto(saved);
    }

    public void deleteCustomer(Integer id) {
        if (!customerRepository.existsById(id)) {
            throw new RuntimeException("Customer not found");
        }
        customerRepository.deleteById(id);
    }

    private CustomerDto toDto(Customer customer) {
        return new CustomerDto(
                customer.getId(),
                customer.getNazwaFirmy(),
                customer.getTelefon(),
                customer.getAdres(),
                customer.getRegion(),
                customer.getHandlowiec(),
                customer.getDataPozyskania(),
                customer.getCzyOdwiedzony(),
                customer.getStatusWizyty(),
                customer.getOpisNotatki(),
                customer.getDataOstatniejEdycji(),
                customer.getNawigacja(),
                customer.getStronaWww(),
                customer.getGrupaCenowa(),
                customer.getOstatniaWizyta()
        );
    }

    private Customer toEntity(CustomerDto dto) {
        return Customer.builder()
                .id(dto.id())
                .nazwaFirmy(dto.nazwaFirmy())
                .telefon(dto.telefon())
                .adres(dto.adres())
                .region(dto.region())
                .handlowiec(dto.handlowiec())
                .dataPozyskania(dto.dataPozyskania())
                .czyOdwiedzony(dto.czyOdwiedzony())
                .statusWizyty(dto.statusWizyty())
                .opisNotatki(dto.opisNotatki())
                .dataOstatniejEdycji(dto.dataOstatniejEdycji())
                .nawigacja(dto.nawigacja())
                .stronaWww(dto.stronaWww())
                .grupaCenowa(dto.grupaCenowa())
                .ostatniaWizyta(dto.ostatniaWizyta())
                .build();
    }
}