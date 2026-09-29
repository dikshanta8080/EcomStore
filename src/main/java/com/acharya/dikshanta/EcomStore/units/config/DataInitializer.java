package com.acharya.dikshanta.EcomStore.units.config;

import com.acharya.dikshanta.EcomStore.products.model.Product;
import com.acharya.dikshanta.EcomStore.products.repository.ProductRepository;
import com.acharya.dikshanta.EcomStore.units.enums.UnitType;
import com.acharya.dikshanta.EcomStore.units.model.ProductUnitConversion;
import com.acharya.dikshanta.EcomStore.units.model.Unit;
import com.acharya.dikshanta.EcomStore.units.repository.ProductUnitConversionRepository;
import com.acharya.dikshanta.EcomStore.units.repository.UnitRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UnitRepository unitRepository;
    private final ProductRepository productRepository;
    private final ProductUnitConversionRepository conversionRepository;

    @Override
    @Transactional
    public void run(String... args) {
        seedUnits();
        backfillProductsWithoutBaseUnit();
    }

    private void seedUnits() {
        // Standard Base Units
        createUnitIfNotExists("Kilogram", "KG", UnitType.WEIGHT);
        createUnitIfNotExists("Gram", "GRAM", UnitType.WEIGHT);
        createUnitIfNotExists("Liter", "LITER", UnitType.VOLUME);
        createUnitIfNotExists("Milliliter", "ML", UnitType.VOLUME);
        createUnitIfNotExists("Piece", "PIECE", UnitType.COUNT);

        // Custom packaging units
        createUnitIfNotExists("Packet", "PACKET", UnitType.COUNT);
        createUnitIfNotExists("Bora / Sack", "BORA", UnitType.OTHER);
        createUnitIfNotExists("Box", "BOX", UnitType.COUNT);
        createUnitIfNotExists("Carton", "CARTON", UnitType.COUNT);
        createUnitIfNotExists("Bag", "BAG", UnitType.OTHER);
        createUnitIfNotExists("Bottle", "BOTTLE", UnitType.COUNT);
    }

    private void createUnitIfNotExists(String name, String symbol, UnitType type) {
        if (!unitRepository.existsByNameIgnoreCase(name) && !unitRepository.existsBySymbolIgnoreCase(symbol)) {
            Unit unit = Unit.builder()
                    .name(name)
                    .symbol(symbol)
                    .unitType(type)
                    .build();
            unitRepository.save(unit);
            log.info("Seeded unit: {} ({})", name, symbol);
        }
    }

    private void backfillProductsWithoutBaseUnit() {
        Unit defaultUnit = unitRepository.findBySymbolIgnoreCase("PIECE")
                .or(() -> unitRepository.findAll().stream().findFirst())
                .orElse(null);

        if (defaultUnit == null) return;

        List<Product> products = productRepository.findAll();
        for (Product product : products) {
            if (product.getBaseUnit() == null) {
                product.setBaseUnit(defaultUnit);
                productRepository.save(product);

                if (!conversionRepository.existsByProductIdAndUnitId(product.getId(), defaultUnit.getId())) {
                    ProductUnitConversion conversion = ProductUnitConversion.builder()
                            .product(product)
                            .unit(defaultUnit)
                            .conversionFactor(BigDecimal.ONE)
                            .active(true)
                            .build();
                    conversionRepository.save(conversion);
                }
                log.info("Assigned default base unit {} to existing product {}", defaultUnit.getSymbol(), product.getName());
            }
        }
    }
}
