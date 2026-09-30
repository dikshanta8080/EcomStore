package com.acharya.dikshanta.retail_store.units.controller;

import com.acharya.dikshanta.retail_store.common.dto.response.ApiResponse;
import com.acharya.dikshanta.retail_store.units.dto.ProductUnitConversionRequest;
import com.acharya.dikshanta.retail_store.units.dto.ProductUnitConversionResponse;
import com.acharya.dikshanta.retail_store.units.service.ProductUnitConversionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products/{productId}/conversions")
@RequiredArgsConstructor
public class ProductUnitConversionController {
    private final ProductUnitConversionService conversionService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductUnitConversionResponse>>> getConversions(
            @PathVariable Long productId) {
        var response = conversionService.getConversionsForProduct(productId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductUnitConversionResponse>> addConversion(
            @PathVariable Long productId,
            @Valid @RequestBody ProductUnitConversionRequest request) {
        var response = conversionService.addConversionToProduct(productId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{conversionId}")
    public ResponseEntity<ApiResponse<ProductUnitConversionResponse>> updateConversion(
            @PathVariable Long productId,
            @PathVariable Long conversionId,
            @Valid @RequestBody ProductUnitConversionRequest request) {
        var response = conversionService.updateConversion(productId, conversionId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{conversionId}")
    public ResponseEntity<ApiResponse<String>> deleteConversion(
            @PathVariable Long productId,
            @PathVariable Long conversionId) {
        conversionService.deleteConversion(productId, conversionId);
        return ResponseEntity.ok(ApiResponse.success("Unit conversion deleted successfully"));
    }
}
