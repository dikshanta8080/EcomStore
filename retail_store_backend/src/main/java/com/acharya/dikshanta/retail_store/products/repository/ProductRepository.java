package com.acharya.dikshanta.retail_store.products.repository;

import com.acharya.dikshanta.retail_store.products.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import com.acharya.dikshanta.retail_store.products.repository.projection.ProductSummaryProjection;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    boolean existsByNameOrSku(String name, String sku);

    boolean existsByBaseUnitId(Long baseUnitId);

    boolean existsByTaxRateId(Long taxRateId);

    @Override
    @EntityGraph(attributePaths = {"category", "inventory", "baseUnit", "unitConversions", "unitConversions.unit", "taxRate"})
    Optional<Product> findById(Long id);

    @Override
    @EntityGraph(attributePaths = {"category", "inventory", "baseUnit", "unitConversions", "unitConversions.unit", "taxRate"})
    Page<Product> findAll(Pageable pageable);

    @Query(value = """
        SELECT 
            COUNT(p.id) AS totalProducts,
            COALESCE(SUM(i.stock), 0) AS totalStockUnits,
            COALESCE(SUM(CASE WHEN i.stock > 10 THEN 1 ELSE 0 END), 0) AS healthyStockCount,
            COALESCE(SUM(CASE WHEN i.stock > 0 AND i.stock <= 10 THEN 1 ELSE 0 END), 0) AS lowStockCount,
            COALESCE(SUM(CASE WHEN i.stock IS NULL OR i.stock <= 0 THEN 1 ELSE 0 END), 0) AS outOfStockCount
        FROM products p
        LEFT JOIN inventory i ON p.id = i.product_id
        WHERE COALESCE(p.active, true) = true
    """, nativeQuery = true)
    ProductSummaryProjection getProductSummary();
}
