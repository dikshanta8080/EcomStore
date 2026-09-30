package com.acharya.dikshanta.retail_store.sales.controller;

import com.acharya.dikshanta.retail_store.common.dto.request.PaginationRequest;
import com.acharya.dikshanta.retail_store.common.dto.response.ApiResponse;
import com.acharya.dikshanta.retail_store.common.dto.response.PagedResponse;
import com.acharya.dikshanta.retail_store.sales.dto.request.SaleRequest;
import com.acharya.dikshanta.retail_store.sales.dto.response.SaleResponse;
import com.acharya.dikshanta.retail_store.sales.service.SaleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/sales")
public class SaleController {
    private final SaleService saleService;

    @PostMapping
    public ResponseEntity<ApiResponse<SaleResponse>> createSale(@Valid @RequestBody SaleRequest request) {
        SaleResponse response = saleService.createSale(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Sale created successfully with PENDING status"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SaleResponse>> getSaleById(@PathVariable Long id) {
        SaleResponse response = saleService.getSaleById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<SaleResponse>>> getAllSales(
            @ModelAttribute PaginationRequest paginationRequest,
            @ModelAttribute com.acharya.dikshanta.retail_store.sales.dto.request.SaleFilterRequest filterRequest) {
        PagedResponse<SaleResponse> response = saleService.getAllSales(paginationRequest, filterRequest);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<SaleResponse>> cancelSale(@PathVariable Long id) {
        SaleResponse response = saleService.cancelSale(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Sale cancelled successfully"));
    }
}
