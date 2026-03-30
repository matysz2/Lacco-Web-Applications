package com.example.Lacco.service;

import com.example.Lacco.model.dto.ProductDto;
import com.example.Lacco.model.entity.Product;
import com.example.Lacco.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for handling product operations
 */
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

    public ProductDto createProduct(ProductDto productDto) {
        Product product = toEntity(productDto);
        product.setId(UUID.randomUUID());
        product.setCreatedAt(OffsetDateTime.now());
        Product saved = productRepository.save(product);
        return toDto(saved);
    }

    public ProductDto updateProduct(UUID id, ProductDto productDto) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        existing.setKodProduktu(productDto.kodProduktu());
        existing.setGrupa(productDto.grupa());
        existing.setJm(productDto.jm());
        existing.setNazwa(productDto.nazwa());
        existing.setOpakowanie(productDto.opakowanie());
        existing.setCenaProdukcji(productDto.cenaProdukcji());
        existing.setCenaA(productDto.cenaA());
        existing.setCenaB(productDto.cenaB());
        existing.setCenaC(productDto.cenaC());
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
        return new ProductDto(
                product.getId(),
                product.getKodProduktu(),
                product.getGrupa(),
                product.getJm(),
                product.getNazwa(),
                product.getOpakowanie(),
                product.getCenaProdukcji(),
                product.getCenaA(),
                product.getCenaB(),
                product.getCenaC(),
                product.getCreatedAt()
        );
    }

    private Product toEntity(ProductDto dto) {
        return Product.builder()
                .id(dto.id())
                .kodProduktu(dto.kodProduktu())
                .grupa(dto.grupa())
                .jm(dto.jm())
                .nazwa(dto.nazwa())
                .opakowanie(dto.opakowanie())
                .cenaProdukcji(dto.cenaProdukcji())
                .cenaA(dto.cenaA())
                .cenaB(dto.cenaB())
                .cenaC(dto.cenaC())
                .createdAt(dto.createdAt())
                .build();
    }
}