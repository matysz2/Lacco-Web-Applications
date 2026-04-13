package com.example.Lacco.service;

import com.example.Lacco.model.dto.CustomerDto;
import com.example.Lacco.model.entity.Customer;
import com.example.Lacco.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

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
        customer.setId(null); 
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
        
        // KONWERSJA: Jeśli encja wymaga LocalDateTime, a DTO daje LocalDate
        existing.setDataPozyskania(customerDto.dataPozyskania() != null ? customerDto.dataPozyskania().atStartOfDay() : null);
        
        existing.setCzyOdwiedzony(customerDto.czyOdwiedzony());
        existing.setStatusWizyty(customerDto.statusWizyty());
        existing.setOpisNotatki(customerDto.opisNotatki());
        
        // Zmiana na LocalDateTime.now() zamiast OffsetDateTime
        existing.setDataOstatniejEdycji(LocalDateTime.now());
        
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
                // Konwersja LocalDateTime z bazy na LocalDate dla DTO
                customer.getDataPozyskania() != null ? customer.getDataPozyskania().toLocalDate() : null,
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
                // Konwersja LocalDate na LocalDateTime dla encji
                .dataPozyskania(dto.dataPozyskania() != null ? dto.dataPozyskania().atStartOfDay() : null)
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