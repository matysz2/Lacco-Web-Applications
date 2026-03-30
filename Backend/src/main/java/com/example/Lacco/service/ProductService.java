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
        product.setUpdatedAt(OffsetDateTime.now());
        Product saved = productRepository.save(product);
        return toDto(saved);
    }

    public ProductDto updateProduct(UUID id, ProductDto productDto) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        existing.setName(productDto.name());
        existing.setDescription(productDto.description());
        existing.setQuantityInStock(productDto.quantityInStock());
        existing.setPricePerKg(productDto.pricePerKg());
        existing.setUpdatedAt(OffsetDateTime.now());
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
                product.getName(),
                product.getDescription(),
                product.getQuantityInStock(),
                product.getPricePerKg(),
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
    }

    private Product toEntity(ProductDto dto) {
        return Product.builder()
                .id(dto.id())
                .name(dto.name())
                .description(dto.description())
                .quantityInStock(dto.quantityInStock())
                .pricePerKg(dto.pricePerKg())
                .createdAt(dto.createdAt())
                .updatedAt(dto.updatedAt())
                .build();
    }
}