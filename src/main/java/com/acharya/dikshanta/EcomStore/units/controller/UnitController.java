package com.acharya.dikshanta.EcomStore.units.controller;

import com.acharya.dikshanta.EcomStore.common.dto.response.ApiResponse;
import com.acharya.dikshanta.EcomStore.units.dto.UnitRequest;
import com.acharya.dikshanta.EcomStore.units.dto.UnitResponse;
import com.acharya.dikshanta.EcomStore.units.enums.UnitType;
import com.acharya.dikshanta.EcomStore.units.service.UnitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/units")
@RequiredArgsConstructor
public class UnitController {
    private final UnitService unitService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UnitResponse>>> getAllUnits(
            @RequestParam(required = false) UnitType unitType) {
        var response = unitService.getAllUnits(unitType);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UnitResponse>> getUnitById(@PathVariable Long id) {
        var response = unitService.getUnitById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UnitResponse>> createUnit(@Valid @RequestBody UnitRequest request) {
        var response = unitService.createUnit(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UnitResponse>> updateUnit(
            @PathVariable Long id,
            @Valid @RequestBody UnitRequest request) {
        var response = unitService.updateUnit(id, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteUnit(@PathVariable Long id) {
        unitService.deleteUnit(id);
        return ResponseEntity.ok(ApiResponse.success("Unit deleted successfully"));
    }
}
