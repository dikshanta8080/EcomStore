package com.acharya.dikshanta.EcomStore.products.controller;

import com.acharya.dikshanta.EcomStore.common.dto.response.ApiResponse;
import com.acharya.dikshanta.EcomStore.products.dto.request.TaxRateRequest;
import com.acharya.dikshanta.EcomStore.products.dto.response.TaxRateResponse;
import com.acharya.dikshanta.EcomStore.products.service.TaxRateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tax-rates")
@RequiredArgsConstructor
public class TaxRateController {

    private final TaxRateService taxRateService;

    @PostMapping
    public ResponseEntity<ApiResponse<TaxRateResponse>> createTaxRate(@Valid @RequestBody TaxRateRequest request) {
        var response = taxRateService.createTaxRate(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Tax rate created successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TaxRateResponse>>> getAllTaxRates() {
        var response = taxRateService.getAllTaxRates();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TaxRateResponse>> getTaxRateById(@PathVariable Long id) {
        var response = taxRateService.getTaxRate(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TaxRateResponse>> updateTaxRate(
            @PathVariable Long id,
            @Valid @RequestBody TaxRateRequest request) {
        var response = taxRateService.updateTaxRate(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Tax rate updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteTaxRate(@PathVariable Long id) {
        taxRateService.deleteTaxRate(id);
        return ResponseEntity.ok(ApiResponse.success("Tax rate deleted successfully"));
    }
}
