package com.acharya.dikshanta.retail_store.units.mapper;

import com.acharya.dikshanta.retail_store.units.dto.UnitRequest;
import com.acharya.dikshanta.retail_store.units.dto.UnitResponse;
import com.acharya.dikshanta.retail_store.units.model.Unit;
import org.springframework.stereotype.Component;

@Component
public class UnitMapper {

    public Unit toEntity(UnitRequest request) {
        return Unit.builder()
                .name(request.name().trim())
                .symbol(request.symbol().trim())
                .unitType(request.unitType())
                .build();
    }

    public UnitResponse toResponse(Unit unit) {
        if (unit == null) return null;
        return UnitResponse.builder()
                .id(unit.getId())
                .name(unit.getName())
                .symbol(unit.getSymbol())
                .unitType(unit.getUnitType())
                .build();
    }

    public void updateEntity(Unit unit, UnitRequest request) {
        if (request.name() != null) {
            unit.setName(request.name().trim());
        }
        if (request.symbol() != null) {
            unit.setSymbol(request.symbol().trim());
        }
        if (request.unitType() != null) {
            unit.setUnitType(request.unitType());
        }
    }
}
