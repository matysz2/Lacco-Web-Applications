package com.example.Lacco.service;

import com.example.Lacco.model.dto.ProductDto;
import com.example.Lacco.model.entity.Product;
import com.example.Lacco.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;

    public List<ProductDto> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public ProductDto getProductById(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return toDto(product);
    }

    @Transactional
    public ProductDto createProduct(ProductDto productDto) {
        Product product = toEntity(productDto);
        product.setId(UUID.randomUUID());
        product.setCreatedAt(OffsetDateTime.now());
        
        // Logika biznesowa: Przy tworzeniu produktu stany_magazynowe są zazwyczaj puste (null)
        // Hibernate zajmie się zapisem kaskadowym jeśli masz CascadeType.ALL
        
        Product saved = productRepository.save(product);
        return toDto(saved);
    }

    @Transactional
    public ProductDto updateProduct(UUID id, ProductDto productDto) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        existing.setKodProduktu(productDto.kodProduktu());
        existing.setGrupa(productDto.grupa());
        existing.setJm(productDto.jm());
        existing.setNazwa(productDto.nazwa());
        existing.setOpakowanie(productDto.opakowanie());
        existing.setCenaA(productDto.cenaA());
        existing.setCenaB(productDto.cenaB());
        existing.setCenaC(productDto.cenaC());
        // cenaProdukcji jest istotna dla analityki marży
        existing.setCenaProdukcji(productDto.cenaProdukcji());

        Product saved = productRepository.save(existing);
        return toDto(saved);
    }

    public void deleteProduct(UUID id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Product not found");
        }
        productRepository.deleteById(id);
    }

    private ProductDto toDto(Product product) {
        // Pobieramy bezpiecznie dane z tabeli stany_magazynowe (przez relację OneToOne)
        BigDecimal ilosc = (product.getStock() != null) 
                ? product.getStock().getIloscDostepna() 
                : BigDecimal.ZERO;

        BigDecimal stanMin = (product.getStock() != null) 
                ? product.getStock().getStanMinimalny() 
                : BigDecimal.ZERO;

        return new ProductDto(
                product.getId(),
                product.getKodProduktu(),
                product.getGrupa(),
                product.getJm(),
                product.getNazwa(),
                product.getOpakowanie(),
                ilosc,        // Pole z tabeli stany_magazynowe
                stanMin,      // Pole z tabeli stany_magazynowe
                product.getCenaA(),
                product.getCenaB(),
                product.getCenaC(),
                product.getCenaProdukcji()
        );
    }

    private Product toEntity(ProductDto dto) {
        return Product.builder()
                .kodProduktu(dto.kodProduktu())
                .grupa(dto.grupa())
                .jm(dto.jm())
                .nazwa(dto.nazwa())
                .opakowanie(dto.opakowanie())
                .cenaA(dto.cenaA())
                .cenaB(dto.cenaB())
                .cenaC(dto.cenaC())
                .cenaProdukcji(dto.cenaProdukcji())
                .build();
    }
}