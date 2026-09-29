package com.acharya.dikshanta.EcomStore.units.service;

import com.acharya.dikshanta.EcomStore.units.dto.UnitRequest;
import com.acharya.dikshanta.EcomStore.units.dto.UnitResponse;
import com.acharya.dikshanta.EcomStore.units.enums.UnitType;
import com.acharya.dikshanta.EcomStore.units.model.Unit;

import java.util.List;

public interface UnitService {
    List<UnitResponse> getAllUnits(UnitType unitType);

    UnitResponse getUnitById(Long id);

    Unit getUnitEntityById(Long id);

    UnitResponse createUnit(UnitRequest request);

    UnitResponse updateUnit(Long id, UnitRequest request);

    void deleteUnit(Long id);
}
