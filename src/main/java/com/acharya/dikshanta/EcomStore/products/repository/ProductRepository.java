package com.acharya.dikshanta.EcomStore.products.repository;

import com.acharya.dikshanta.EcomStore.products.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    boolean existsByNameOrSku(String name, String sku);

    boolean existsByBaseUnitId(Long baseUnitId);

    @Override
    @EntityGraph(attributePaths = {"category", "inventory", "baseUnit", "unitConversions", "unitConversions.unit"})
    Optional<Product> findById(Long id);

    @Override
    @EntityGraph(attributePaths = {"category", "inventory", "baseUnit", "unitConversions", "unitConversions.unit"})
    Page<Product> findAll(Pageable pageable);
}
