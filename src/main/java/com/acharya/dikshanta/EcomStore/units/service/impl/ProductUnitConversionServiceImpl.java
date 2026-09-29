package com.acharya.dikshanta.EcomStore.units.service.impl;

import com.acharya.dikshanta.EcomStore.common.exceptions.BusinessException;
import com.acharya.dikshanta.EcomStore.common.exceptions.DuplicateResourceException;
import com.acharya.dikshanta.EcomStore.common.exceptions.ResourceNotFoundException;
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
import com.acharya.dikshanta.EcomStore.units.service.ProductUnitConversionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductUnitConversionServiceImpl implements ProductUnitConversionService {
    private final ProductUnitConversionRepository conversionRepository;
    private final ProductRepository productRepository;
    private final UnitRepository unitRepository;
    private final ProductUnitConversionMapper conversionMapper;
    private final InventoryMovementRepository movementRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ProductUnitConversionResponse> getConversionsForProduct(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product not found with id: " + productId);
        }
        return conversionRepository.findByProductId(productId)
                .stream()
                .map(conversionMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public ProductUnitConversionResponse addConversionToProduct(Long productId, ProductUnitConversionRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        Unit unit = unitRepository.findById(request.unitId())
                .orElseThrow(() -> new ResourceNotFoundException("Unit not found with id: " + request.unitId()));

        Unit baseUnit = product.getBaseUnit();
        validateUnitCompatibility(unit, baseUnit);

        if (conversionRepository.existsByProductIdAndUnitId(productId, request.unitId())) {
            throw new DuplicateResourceException("Unit conversion for '" + unit.getName() + "' already exists for this product");
        }

        if (request.conversionFactor().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Conversion factor must be greater than 0");
        }

        ProductUnitConversion conversion = ProductUnitConversion.builder()
                .product(product)
                .unit(unit)
                .conversionFactor(request.conversionFactor())
                .active(request.active() == null || request.active())
                .build();

        ProductUnitConversion saved = conversionRepository.save(conversion);
        product.addUnitConversion(saved);

        return conversionMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public ProductUnitConversionResponse updateConversion(Long productId, Long conversionId, ProductUnitConversionRequest request) {
        ProductUnitConversion conversion = conversionRepository.findByIdAndProductId(conversionId, productId)
                .orElseThrow(() -> new ResourceNotFoundException("Unit conversion not found with id: " + conversionId + " for product id: " + productId));

        if (request.conversionFactor() != null) {
            if (request.conversionFactor().compareTo(BigDecimal.ZERO) <= 0) {
                throw new BusinessException("Conversion factor must be greater than 0");
            }
            conversion.setConversionFactor(request.conversionFactor());
        }

        if (request.active() != null) {
            conversion.setActive(request.active());
        }

        ProductUnitConversion updated = conversionRepository.save(conversion);
        return conversionMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void deleteConversion(Long productId, Long conversionId) {
        ProductUnitConversion conversion = conversionRepository.findByIdAndProductId(conversionId, productId)
                .orElseThrow(() -> new ResourceNotFoundException("Unit conversion not found with id: " + conversionId + " for product id: " + productId));

        if (movementRepository.existsByInventoryProduct_IdAndUnitId(productId, conversion.getUnit().getId())) {
            throw new BusinessException("Cannot delete conversion for unit '" + conversion.getUnit().getName() +
                    "' because historical stock movements exist for this product and unit. Deactivate the conversion instead.");
        }

        conversionRepository.delete(conversion);
    }

    private void validateUnitCompatibility(Unit unit, Unit baseUnit) {
        if (baseUnit == null) {
            return;
        }

        checkCompatibility(unit, baseUnit);
    }

    public static void checkCompatibility(Unit unit, Unit baseUnit) {
        if ((unit.getUnitType() == UnitType.WEIGHT && baseUnit.getUnitType() == UnitType.VOLUME) ||
                (unit.getUnitType() == UnitType.VOLUME && baseUnit.getUnitType() == UnitType.WEIGHT)) {
            throw new BusinessException("Incompatible unit types: Cannot convert " + unit.getUnitType() +
                    " unit ('" + unit.getSymbol() + "') to " + baseUnit.getUnitType() + " base unit ('" + baseUnit.getSymbol() + "')");
        }
    }
}
