package com.acharya.dikshanta.retail_store.units.service;

import com.acharya.dikshanta.retail_store.units.dto.UnitRequest;
import com.acharya.dikshanta.retail_store.units.dto.UnitResponse;
import com.acharya.dikshanta.retail_store.units.enums.UnitType;
import com.acharya.dikshanta.retail_store.units.model.Unit;

import java.util.List;

public interface UnitService {
    List<UnitResponse> getAllUnits(UnitType unitType);

    UnitResponse getUnitById(Long id);

    Unit getUnitEntityById(Long id);

    UnitResponse createUnit(UnitRequest request);

    UnitResponse updateUnit(Long id, UnitRequest request);

    void deleteUnit(Long id);
}
