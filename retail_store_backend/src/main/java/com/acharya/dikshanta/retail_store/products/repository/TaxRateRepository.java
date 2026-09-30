package com.acharya.dikshanta.retail_store.products.repository;

import com.acharya.dikshanta.retail_store.products.model.TaxRate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface TaxRateRepository extends JpaRepository<TaxRate, Long> {
    Optional<TaxRate> findByRate(BigDecimal rate);

    boolean existsByRate(BigDecimal rate);
}
