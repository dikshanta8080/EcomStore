package com.acharya.dikshanta.EcomStore.products.repository;

import com.acharya.dikshanta.EcomStore.products.model.TaxRate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface TaxRateRepository extends JpaRepository<TaxRate, Long> {
    Optional<TaxRate> findByRate(BigDecimal rate);

    boolean existsByRate(BigDecimal rate);
}
