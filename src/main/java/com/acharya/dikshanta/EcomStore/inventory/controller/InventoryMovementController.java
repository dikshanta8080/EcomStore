package com.acharya.dikshanta.EcomStore.inventory.controller;

import com.acharya.dikshanta.EcomStore.common.dto.request.PaginationRequest;
import com.acharya.dikshanta.EcomStore.common.dto.response.ApiResponse;
import com.acharya.dikshanta.EcomStore.common.dto.response.PagedResponse;
import com.acharya.dikshanta.EcomStore.inventory.dto.request.InventoryMovementFilterRequest;
import com.acharya.dikshanta.EcomStore.inventory.dto.request.InventoryMovementRequest;
import com.acharya.dikshanta.EcomStore.inventory.dto.response.InventoryMovementResponse;
import com.acharya.dikshanta.EcomStore.inventory.service.InventoryMovementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/inventory/movements", "/inventory"})
@RequiredArgsConstructor
public class InventoryMovementController {
    private final InventoryMovementService inventoryMovementService;

    @PostMapping
    public ResponseEntity<ApiResponse<InventoryMovementResponse>> createInventoryMovement(
            @Valid @RequestBody InventoryMovementRequest request) {
        var response = inventoryMovementService.createInventoryMovement(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<InventoryMovementResponse>> getInventoryMovement(@PathVariable Long id) {
        var response = inventoryMovementService.getInventoryMovement(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<InventoryMovementResponse>>> getAllInventoryMovements(
            @ModelAttribute PaginationRequest paginationRequest,
            @ModelAttribute InventoryMovementFilterRequest filterRequest) {
        var response = inventoryMovementService.getAllInventoryMovements(paginationRequest.toPageable(), filterRequest);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<InventoryMovementResponse>> deleteInventoryMovement(@PathVariable Long id) {
        var response = inventoryMovementService.deleteInventoryMovement(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
