package com.acharya.dikshanta.EcomStore.units.repository;

import com.acharya.dikshanta.EcomStore.units.enums.UnitType;
import com.acharya.dikshanta.EcomStore.units.model.Unit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UnitRepository extends JpaRepository<Unit, Long> {
    boolean existsByNameIgnoreCase(String name);

    boolean existsBySymbolIgnoreCase(String symbol);

    boolean existsByNameIgnoreCaseOrSymbolIgnoreCase(String name, String symbol);

    Optional<Unit> findByNameIgnoreCase(String name);

    Optional<Unit> findBySymbolIgnoreCase(String symbol);

    List<Unit> findByUnitType(UnitType unitType);
}
