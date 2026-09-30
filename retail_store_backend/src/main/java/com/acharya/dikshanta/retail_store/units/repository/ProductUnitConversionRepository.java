package com.acharya.dikshanta.retail_store.units.repository;

import com.acharya.dikshanta.retail_store.units.model.ProductUnitConversion;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductUnitConversionRepository extends JpaRepository<ProductUnitConversion, Long> {

    @EntityGraph(attributePaths = {"unit", "product"})
    List<ProductUnitConversion> findByProductId(Long productId);

    @EntityGraph(attributePaths = {"unit", "product"})
    List<ProductUnitConversion> findByProductIdAndActiveTrue(Long productId);

    @EntityGraph(attributePaths = {"unit", "product"})
    Optional<ProductUnitConversion> findByProductIdAndUnitId(Long productId, Long unitId);

    @EntityGraph(attributePaths = {"unit", "product"})
    Optional<ProductUnitConversion> findByIdAndProductId(Long id, Long productId);

    boolean existsByProductIdAndUnitId(Long productId, Long unitId);

    boolean existsByUnitId(Long unitId);
}
