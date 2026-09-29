package com.acharya.dikshanta.EcomStore.units.service.impl;

import com.acharya.dikshanta.EcomStore.common.exceptions.BusinessException;
import com.acharya.dikshanta.EcomStore.common.exceptions.DuplicateResourceException;
import com.acharya.dikshanta.EcomStore.common.exceptions.ResourceNotFoundException;
import com.acharya.dikshanta.EcomStore.inventory.repository.InventoryMovementRepository;
import com.acharya.dikshanta.EcomStore.products.repository.ProductRepository;
import com.acharya.dikshanta.EcomStore.units.dto.UnitRequest;
import com.acharya.dikshanta.EcomStore.units.dto.UnitResponse;
import com.acharya.dikshanta.EcomStore.units.enums.UnitType;
import com.acharya.dikshanta.EcomStore.units.mapper.UnitMapper;
import com.acharya.dikshanta.EcomStore.units.model.Unit;
import com.acharya.dikshanta.EcomStore.units.repository.ProductUnitConversionRepository;
import com.acharya.dikshanta.EcomStore.units.repository.UnitRepository;
import com.acharya.dikshanta.EcomStore.units.service.UnitService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UnitServiceImpl implements UnitService {
    private final UnitRepository unitRepository;
    private final UnitMapper unitMapper;
    private final ProductRepository productRepository;
    private final ProductUnitConversionRepository productUnitConversionRepository;
    private final InventoryMovementRepository inventoryMovementRepository;

    @Override
    @Transactional(readOnly = true)
    public List<UnitResponse> getAllUnits(UnitType unitType) {
        List<Unit> units = (unitType != null)
                ? unitRepository.findByUnitType(unitType)
                : unitRepository.findAll();
        return units.stream().map(unitMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public UnitResponse getUnitById(Long id) {
        return unitMapper.toResponse(getUnitEntityById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public Unit getUnitEntityById(Long id) {
        return unitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Unit not found with id: " + id));
    }

    @Override
    @Transactional
    public UnitResponse createUnit(UnitRequest request) {
        String trimmedName = request.name().trim();
        String trimmedSymbol = request.symbol().trim();

        if (unitRepository.existsByNameIgnoreCase(trimmedName)) {
            throw new DuplicateResourceException("Unit with name '" + trimmedName + "' already exists");
        }
        if (unitRepository.existsBySymbolIgnoreCase(trimmedSymbol)) {
            throw new DuplicateResourceException("Unit with symbol '" + trimmedSymbol + "' already exists");
        }

        Unit unit = unitMapper.toEntity(request);
        Unit saved = unitRepository.save(unit);
        return unitMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public UnitResponse updateUnit(Long id, UnitRequest request) {
        Unit unit = getUnitEntityById(id);
        String trimmedName = request.name().trim();
        String trimmedSymbol = request.symbol().trim();

        if (!unit.getName().equalsIgnoreCase(trimmedName) && unitRepository.existsByNameIgnoreCase(trimmedName)) {
            throw new DuplicateResourceException("Unit with name '" + trimmedName + "' already exists");
        }
        if (!unit.getSymbol().equalsIgnoreCase(trimmedSymbol) && unitRepository.existsBySymbolIgnoreCase(trimmedSymbol)) {
            throw new DuplicateResourceException("Unit with symbol '" + trimmedSymbol + "' already exists");
        }

        unitMapper.updateEntity(unit, request);
        Unit updated = unitRepository.save(unit);
        return unitMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void deleteUnit(Long id) {
        Unit unit = getUnitEntityById(id);

        if (inventoryMovementRepository.existsByUnitIdOrBaseUnitId(id, id)) {
            throw new BusinessException("Cannot delete unit '" + unit.getName() + "' because it is referenced in historical stock movements");
        }

        if (productRepository.existsByBaseUnitId(id)) {
            throw new BusinessException("Cannot delete unit '" + unit.getName() + "' because it is used as a base unit for existing products");
        }

        if (productUnitConversionRepository.existsByUnitId(id)) {
            throw new BusinessException("Cannot delete unit '" + unit.getName() + "' because it is configured in product unit conversions");
        }

        unitRepository.delete(unit);
    }
}
