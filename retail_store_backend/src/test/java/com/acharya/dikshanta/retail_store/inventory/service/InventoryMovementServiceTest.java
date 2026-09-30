package com.acharya.dikshanta.retail_store.inventory.service;

import com.acharya.dikshanta.retail_store.common.exceptions.BusinessException;
import com.acharya.dikshanta.retail_store.inventory.dto.request.InventoryMovementRequest;
import com.acharya.dikshanta.retail_store.inventory.dto.response.InventoryMovementResponse;
import com.acharya.dikshanta.retail_store.inventory.enums.MovementType;
import com.acharya.dikshanta.retail_store.inventory.mapper.InventoryMapper;
import com.acharya.dikshanta.retail_store.inventory.model.Inventory;
import com.acharya.dikshanta.retail_store.inventory.model.InventoryMovement;
import com.acharya.dikshanta.retail_store.inventory.repository.InventoryMovementRepository;
import com.acharya.dikshanta.retail_store.inventory.repository.InventoryRepository;
import com.acharya.dikshanta.retail_store.inventory.service.impl.InventoryMovementServiceImpl;
import com.acharya.dikshanta.retail_store.products.model.Category;
import com.acharya.dikshanta.retail_store.products.model.Product;
import com.acharya.dikshanta.retail_store.units.enums.UnitType;
import com.acharya.dikshanta.retail_store.units.model.ProductUnitConversion;
import com.acharya.dikshanta.retail_store.units.model.Unit;
import com.acharya.dikshanta.retail_store.units.repository.ProductUnitConversionRepository;
import com.acharya.dikshanta.retail_store.units.repository.UnitRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import com.acharya.dikshanta.retail_store.common.dto.response.PagedResponse;
import com.acharya.dikshanta.retail_store.inventory.dto.request.InventoryMovementFilterRequest;
import com.acharya.dikshanta.retail_store.inventory.specifications.InventoryMovementSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryMovementServiceTest {

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private InventoryMovementRepository inventoryMovementRepository;

    @Spy
    private InventoryMapper inventoryMapper = new InventoryMapper();

    @Mock
    private UnitRepository unitRepository;

    @Mock
    private ProductUnitConversionRepository productUnitConversionRepository;

    @Mock
    private InventoryMovementSpecification inventoryMovementSpecification;

    @InjectMocks
    private InventoryMovementServiceImpl inventoryMovementService;

    private Product rice;
    private Inventory riceInventory;
    private Unit kgUnit;
    private Unit boraUnit;
    private Unit literUnit;
    private ProductUnitConversion boraConversion;

    @BeforeEach
    void setUp() {
        kgUnit = Unit.builder()
                .id(1L)
                .name("Kilogram")
                .symbol("KG")
                .unitType(UnitType.WEIGHT)
                .build();

        boraUnit = Unit.builder()
                .id(2L)
                .name("Bora / Sack")
                .symbol("BORA")
                .unitType(UnitType.OTHER)
                .build();

        literUnit = Unit.builder()
                .id(3L)
                .name("Liter")
                .symbol("LITER")
                .unitType(UnitType.VOLUME)
                .build();

        Category grains = Category.builder()
                .id(1L)
                .name("Grains")
                .build();

        rice = Product.builder()
                .id(10L)
                .name("Basmati Rice")
                .sku("RICE-BASMATI-001")
                .price(new BigDecimal("80.00")) // Rs. 80 per KG
                .category(grains)
                .baseUnit(kgUnit)
                .build();

        riceInventory = Inventory.builder()
                .id(20L)
                .product(rice)
                .stock(new BigDecimal("250.0000")) // Initially 250 KG
                .build();
        rice.setInventory(riceInventory);

        boraConversion = ProductUnitConversion.builder()
                .id(100L)
                .product(rice)
                .unit(boraUnit)
                .conversionFactor(new BigDecimal("50.0000")) // 1 BORA = 50 KG
                .active(true)
                .build();
    }

    @Test
    void shouldCorrectlyReceive5BoraOfRiceAndIncreaseStockBy250KG() {
        // Arrange
        when(inventoryRepository.findByProductId(10L)).thenReturn(Optional.of(riceInventory));
        when(unitRepository.findById(2L)).thenReturn(Optional.of(boraUnit));
        when(productUnitConversionRepository.findByProductIdAndUnitId(10L, 2L)).thenReturn(Optional.of(boraConversion));
        when(inventoryMovementRepository.save(any(InventoryMovement.class))).thenAnswer(i -> {
            InventoryMovement m = i.getArgument(0);
            m.setId(999L);
            return m;
        });

        InventoryMovementRequest request = new InventoryMovementRequest(
                10L,
                MovementType.IN,
                new BigDecimal("5"), // 5 BORA
                2L,
                new BigDecimal("4000.00") // Rs. 4,000 per BORA
        );

        // Act
        InventoryMovementResponse response = inventoryMovementService.createInventoryMovement(request);

        // Assert
        assertNotNull(response);
        assertEquals(new BigDecimal("5"), response.quantity());
        assertEquals("BORA", response.unitSymbol());
        assertEquals(new BigDecimal("50.0000"), response.conversionFactor());
        // 5 BORA * 50 KG = 250 KG baseQuantity
        assertEquals(new BigDecimal("250.0000"), response.baseQuantity());
        assertEquals("KG", response.baseUnitSymbol());
        assertEquals(new BigDecimal("4000.00"), response.unitPrice());
        // 5 * 4000 = 20,000 Total
        assertEquals(new BigDecimal("20000.00"), response.totalAmount());

        // Inventory stock should now be 250 + 250 = 500 KG
        assertEquals(new BigDecimal("500.0000"), riceInventory.getStock());
    }

    @Test
    void shouldCorrectlyDispatchInBaseUnit() {
        // Arrange
        when(inventoryRepository.findByProductId(10L)).thenReturn(Optional.of(riceInventory));
        when(unitRepository.findById(1L)).thenReturn(Optional.of(kgUnit));
        when(inventoryMovementRepository.save(any(InventoryMovement.class))).thenAnswer(i -> {
            InventoryMovement m = i.getArgument(0);
            m.setId(1001L);
            return m;
        });

        InventoryMovementRequest request = new InventoryMovementRequest(
                10L,
                MovementType.OUT,
                new BigDecimal("50"), // 50 KG
                1L, // KG is base unit
                null // let price default
        );

        // Act
        InventoryMovementResponse response = inventoryMovementService.createInventoryMovement(request);

        // Assert
        assertNotNull(response);
        assertEquals(new BigDecimal("50"), response.quantity());
        assertEquals(BigDecimal.ONE, response.conversionFactor());
        assertEquals(new BigDecimal("50"), response.baseQuantity());
        assertEquals(new BigDecimal("200.0000"), riceInventory.getStock()); // 250 - 50 = 200 KG
        assertEquals(new BigDecimal("80.00"), response.unitPrice());
    }

    @Test
    void shouldThrowExceptionWhenConvertingIncompatibleWeightToVolume() {
        when(inventoryRepository.findByProductId(10L)).thenReturn(Optional.of(riceInventory));
        when(unitRepository.findById(3L)).thenReturn(Optional.of(literUnit));

        InventoryMovementRequest request = new InventoryMovementRequest(
                10L,
                MovementType.IN,
                new BigDecimal("10"),
                3L, // LITER for Rice (whose base is KG)
                null
        );

        BusinessException exception = assertThrows(BusinessException.class, () ->
                inventoryMovementService.createInventoryMovement(request)
        );
        assertTrue(exception.getMessage().contains("Incompatible unit types"));
    }

    @Test
    void shouldThrowExceptionWhenDispatchingMoreThanAvailableStock() {
        when(inventoryRepository.findByProductId(10L)).thenReturn(Optional.of(riceInventory));
        when(unitRepository.findById(2L)).thenReturn(Optional.of(boraUnit));
        when(productUnitConversionRepository.findByProductIdAndUnitId(10L, 2L)).thenReturn(Optional.of(boraConversion));

        // 6 BORA * 50 KG = 300 KG, but stock is only 250 KG
        InventoryMovementRequest request = new InventoryMovementRequest(
                10L,
                MovementType.OUT,
                new BigDecimal("6"),
                2L,
                null
        );

        BusinessException exception = assertThrows(BusinessException.class, () ->
                inventoryMovementService.createInventoryMovement(request)
        );
        assertTrue(exception.getMessage().contains("Insufficient stock"));
    }

    @Test
    void shouldGetAllInventoryMovementsWithDynamicFiltering() {
        InventoryMovement movement = InventoryMovement.builder()
                .id(100L)
                .movementType(MovementType.IN)
                .quantity(new BigDecimal("10"))
                .unit(kgUnit)
                .baseQuantity(new BigDecimal("10"))
                .baseUnit(kgUnit)
                .conversionFactor(BigDecimal.ONE)
                .unitPrice(new BigDecimal("80.00"))
                .totalAmount(new BigDecimal("800.00"))
                .inventory(riceInventory)
                .build();

        Page<InventoryMovement> pagedMovements = new PageImpl<>(List.of(movement), PageRequest.of(0, 10), 1);
        Specification<InventoryMovement> mockSpec = mock(Specification.class);
        InventoryMovementFilterRequest filterRequest = new InventoryMovementFilterRequest(
                "Rice",
                "Rice",
                "RICE-001",
                10L,
                1L,
                MovementType.IN,
                1L,
                new BigDecimal("5"),
                new BigDecimal("50"),
                new BigDecimal("100"),
                new BigDecimal("1000"),
                null,
                null
        );

        when(inventoryMovementSpecification.getSpecification(filterRequest)).thenReturn(mockSpec);
        when(inventoryMovementRepository.findAll(eq(mockSpec), any(Pageable.class))).thenReturn(pagedMovements);

        PagedResponse<InventoryMovementResponse> result = inventoryMovementService.getAllInventoryMovements(
                PageRequest.of(0, 10),
                filterRequest
        );

        assertNotNull(result);
        assertEquals(1, result.totalElements());
        assertEquals(1, result.content().size());
        assertEquals(100L, result.content().get(0).id());
        assertEquals("Basmati Rice", result.content().get(0).productName());
        assertEquals(MovementType.IN, result.content().get(0).movementType());
        verify(inventoryMovementSpecification).getSpecification(filterRequest);
        verify(inventoryMovementRepository).findAll(eq(mockSpec), any(Pageable.class));
    }
}
