package com.acharya.dikshanta.EcomStore.inventory.service.impl;

import com.acharya.dikshanta.EcomStore.common.dto.response.PagedResponse;
import com.acharya.dikshanta.EcomStore.common.exceptions.BusinessException;
import com.acharya.dikshanta.EcomStore.common.exceptions.ResourceNotFoundException;
import com.acharya.dikshanta.EcomStore.inventory.dto.request.InventoryMovementRequest;
import com.acharya.dikshanta.EcomStore.inventory.dto.response.InventoryMovementResponse;
import com.acharya.dikshanta.EcomStore.inventory.enums.MovementType;
import com.acharya.dikshanta.EcomStore.inventory.mapper.InventoryMapper;
import com.acharya.dikshanta.EcomStore.inventory.model.Inventory;
import com.acharya.dikshanta.EcomStore.inventory.model.InventoryMovement;
import com.acharya.dikshanta.EcomStore.inventory.repository.InventoryMovementRepository;
import com.acharya.dikshanta.EcomStore.inventory.repository.InventoryRepository;
import com.acharya.dikshanta.EcomStore.inventory.service.InventoryMovementService;
import com.acharya.dikshanta.EcomStore.products.model.Product;
import com.acharya.dikshanta.EcomStore.units.model.ProductUnitConversion;
import com.acharya.dikshanta.EcomStore.units.model.Unit;
import com.acharya.dikshanta.EcomStore.units.repository.ProductUnitConversionRepository;
import com.acharya.dikshanta.EcomStore.units.repository.UnitRepository;
import com.acharya.dikshanta.EcomStore.units.service.impl.ProductUnitConversionServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class InventoryMovementServiceImpl implements InventoryMovementService {
    private final InventoryRepository inventoryRepository;
    private final InventoryMovementRepository inventoryMovementRepository;
    private final InventoryMapper inventoryMapper;
    private final UnitRepository unitRepository;
    private final ProductUnitConversionRepository productUnitConversionRepository;

    @Override
    @Transactional
    public InventoryMovementResponse createInventoryMovement(InventoryMovementRequest request) {
        if (request.quantity() == null || request.quantity().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Quantity must be greater than 0");
        }

        Inventory inventory = findInventoryByProductId(request.productId());
        Product product = inventory.getProduct();
        Unit baseUnit = product.getBaseUnit();

        if (baseUnit == null) {
            throw new BusinessException("Product '" + product.getName() + "' does not have a configured base unit");
        }

        if (Boolean.FALSE.equals(product.getActive())) {
            throw new BusinessException("Cannot record inventory movement for archived product '" + product.getName() + "'. Restore the product first.");
        }

        Unit transactionUnit = unitRepository.findById(request.unitId())
                .orElseThrow(() -> new ResourceNotFoundException("Unit not found with id: " + request.unitId()));

        validateUnitCompatibility(transactionUnit, baseUnit);

        BigDecimal conversionFactor = resolveConversionFactor(product, transactionUnit, baseUnit);
        BigDecimal baseQuantity = request.quantity().multiply(conversionFactor);

        BigDecimal unitPrice = resolveUnitPrice(request.unitPrice(), product, conversionFactor, transactionUnit, baseUnit);
        BigDecimal totalAmount = request.quantity().multiply(unitPrice);

        if (request.movementType() == MovementType.IN) {
            inventory.updateStock(baseQuantity);
        } else {
            if (baseQuantity.compareTo(inventory.getStock()) > 0) {
                throw new BusinessException("Insufficient stock. Required: " + baseQuantity + " " + baseUnit.getSymbol() +
                        ", Available: " + inventory.getStock() + " " + baseUnit.getSymbol());
            }
            inventory.reduceStock(baseQuantity);
        }

        InventoryMovement inventoryMovement = InventoryMovement.builder()
                .movementType(request.movementType())
                .quantity(request.quantity())
                .unit(transactionUnit)
                .baseQuantity(baseQuantity)
                .baseUnit(baseUnit)
                .conversionFactor(conversionFactor)
                .unitPrice(unitPrice)
                .totalAmount(totalAmount)
                .inventory(inventory)
                .build();

        inventory.addInventoryMovement(inventoryMovement);
        inventoryMovementRepository.save(inventoryMovement);

        return inventoryMapper.toResponse(inventoryMovement);
    }

    @Override
    @Transactional(readOnly = true)
    public InventoryMovementResponse getInventoryMovement(Long id) {
        InventoryMovement inventoryMovement = findInventoryMovementById(id);
        return inventoryMapper.toResponse(inventoryMovement);
    }

    @Transactional
    @Override
    public InventoryMovementResponse deleteInventoryMovement(Long id) {
        InventoryMovement inventoryMovement = findInventoryMovementById(id);
        inventoryMovementRepository.delete(inventoryMovement);
        return inventoryMapper.toResponse(inventoryMovement);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<InventoryMovementResponse> getAllInventoryMovements(Pageable pageable) {
        Page<InventoryMovement> inventoryMovements = inventoryMovementRepository.findAll(pageable);
        Page<InventoryMovementResponse> response = inventoryMovements.map(inventoryMapper::toResponse);
        return PagedResponse.from(response);
    }

    private Inventory findInventoryByProductId(Long productId) {
        return inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product inventory not found with product id: " + productId));
    }

    private InventoryMovement findInventoryMovementById(Long id) {
        return inventoryMovementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory movement not found with id: " + id));
    }

    private BigDecimal resolveConversionFactor(Product product, Unit transactionUnit, Unit baseUnit) {
        if (transactionUnit.getId().equals(baseUnit.getId())) {
            return BigDecimal.ONE;
        }

        ProductUnitConversion conversion = productUnitConversionRepository
                .findByProductIdAndUnitId(product.getId(), transactionUnit.getId())
                .orElseThrow(() -> new BusinessException("Transaction unit '" + transactionUnit.getName() +
                        "' is not configured for product '" + product.getName() + "'"));

        if (conversion.getActive() != null && !conversion.getActive()) {
            throw new BusinessException("Unit conversion for '" + transactionUnit.getName() +
                    "' is inactive for product '" + product.getName() + "'");
        }

        BigDecimal factor = conversion.getConversionFactor();
        if (factor == null || factor.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Invalid conversion factor for unit '" + transactionUnit.getName() + "'");
        }

        return factor;
    }

    private BigDecimal resolveUnitPrice(BigDecimal requestedPrice, Product product, BigDecimal conversionFactor, Unit unit, Unit baseUnit) {
        if (requestedPrice != null) {
            return requestedPrice;
        }

        BigDecimal basePrice = product.getPrice();
        if (basePrice == null) {
            return BigDecimal.ZERO;
        }

        if (unit.getId().equals(baseUnit.getId())) {
            return basePrice;
        }

        return basePrice.multiply(conversionFactor);
    }

    private void validateUnitCompatibility(Unit unit, Unit baseUnit) {
        ProductUnitConversionServiceImpl.checkCompatibility(unit, baseUnit);
    }
}
