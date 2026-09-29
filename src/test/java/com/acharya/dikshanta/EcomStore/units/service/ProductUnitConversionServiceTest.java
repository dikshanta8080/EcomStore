package com.acharya.dikshanta.EcomStore.units.service;

import com.acharya.dikshanta.EcomStore.common.exceptions.BusinessException;
import com.acharya.dikshanta.EcomStore.common.exceptions.DuplicateResourceException;
import com.acharya.dikshanta.EcomStore.inventory.repository.InventoryMovementRepository;
import com.acharya.dikshanta.EcomStore.products.model.Product;
import com.acharya.dikshanta.EcomStore.products.repository.ProductRepository;
import com.acharya.dikshanta.EcomStore.units.dto.ProductUnitConversionRequest;
import com.acharya.dikshanta.EcomStore.units.dto.ProductUnitConversionResponse;
import com.acharya.dikshanta.EcomStore.units.enums.UnitType;
import com.acharya.dikshanta.EcomStore.units.mapper.ProductUnitConversionMapper;
import com.acharya.dikshanta.EcomStore.units.model.ProductUnitConversion;
import com.acharya.dikshanta.EcomStore.units.model.Unit;
import com.acharya.dikshanta.EcomStore.units.repository.ProductUnitConversionRepository;
import com.acharya.dikshanta.EcomStore.units.repository.UnitRepository;
import com.acharya.dikshanta.EcomStore.units.service.impl.ProductUnitConversionServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductUnitConversionServiceTest {

    @Mock
    private ProductUnitConversionRepository conversionRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UnitRepository unitRepository;

    @Spy
    private ProductUnitConversionMapper conversionMapper = new ProductUnitConversionMapper();

    @Mock
    private InventoryMovementRepository movementRepository;

    @InjectMocks
    private ProductUnitConversionServiceImpl conversionService;

    private Product rice;
    private Unit kgUnit;
    private Unit boraUnit;
    private Unit literUnit;

    @BeforeEach
    void setUp() {
        kgUnit = Unit.builder().id(1L).name("Kilogram").symbol("KG").unitType(UnitType.WEIGHT).build();
        boraUnit = Unit.builder().id(2L).name("Bora").symbol("BORA").unitType(UnitType.OTHER).build();
        literUnit = Unit.builder().id(3L).name("Liter").symbol("LITER").unitType(UnitType.VOLUME).build();

        rice = Product.builder()
                .id(10L)
                .name("Rice")
                .sku("RICE-1")
                .price(new BigDecimal("80"))
                .baseUnit(kgUnit)
                .build();
    }

    @Test
    void shouldSuccessfullyAddConversion() {
        when(productRepository.findById(10L)).thenReturn(Optional.of(rice));
        when(unitRepository.findById(2L)).thenReturn(Optional.of(boraUnit));
        when(conversionRepository.existsByProductIdAndUnitId(10L, 2L)).thenReturn(false);
        when(conversionRepository.save(any(ProductUnitConversion.class))).thenAnswer(i -> {
            ProductUnitConversion c = i.getArgument(0);
            c.setId(50L);
            return c;
        });

        ProductUnitConversionRequest request = new ProductUnitConversionRequest(2L, new BigDecimal("50.0"), true);
        ProductUnitConversionResponse response = conversionService.addConversionToProduct(10L, request);

        assertNotNull(response);
        assertEquals(50L, response.id());
        assertEquals("BORA", response.unitSymbol());
        assertEquals(new BigDecimal("50.0"), response.conversionFactor());
        assertTrue(response.active());
    }

    @Test
    void shouldRejectIncompatibleUnitConversion() {
        when(productRepository.findById(10L)).thenReturn(Optional.of(rice));
        when(unitRepository.findById(3L)).thenReturn(Optional.of(literUnit));

        ProductUnitConversionRequest request = new ProductUnitConversionRequest(3L, new BigDecimal("1.0"), true);

        BusinessException ex = assertThrows(BusinessException.class, () ->
                conversionService.addConversionToProduct(10L, request)
        );
        assertTrue(ex.getMessage().contains("Incompatible unit types"));
    }

    @Test
    void shouldRejectDuplicateConversion() {
        when(productRepository.findById(10L)).thenReturn(Optional.of(rice));
        when(unitRepository.findById(2L)).thenReturn(Optional.of(boraUnit));
        when(conversionRepository.existsByProductIdAndUnitId(10L, 2L)).thenReturn(true);

        ProductUnitConversionRequest request = new ProductUnitConversionRequest(2L, new BigDecimal("50.0"), true);

        assertThrows(DuplicateResourceException.class, () ->
                conversionService.addConversionToProduct(10L, request)
        );
    }

    @Test
    void shouldPreventDeletingConversionIfHistoricalMovementsExist() {
        ProductUnitConversion conversion = ProductUnitConversion.builder()
                .id(50L)
                .product(rice)
                .unit(boraUnit)
                .conversionFactor(new BigDecimal("50"))
                .active(true)
                .build();

        when(conversionRepository.findByIdAndProductId(50L, 10L)).thenReturn(Optional.of(conversion));
        when(movementRepository.existsByInventoryProduct_IdAndUnitId(10L, 2L)).thenReturn(true);

        BusinessException ex = assertThrows(BusinessException.class, () ->
                conversionService.deleteConversion(10L, 50L)
        );
        assertTrue(ex.getMessage().contains("historical stock movements exist"));
        verify(conversionRepository, never()).delete(any());
    }
}
