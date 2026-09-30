package com.acharya.dikshanta.retail_store.units.service;

import com.acharya.dikshanta.retail_store.units.dto.ProductUnitConversionRequest;
import com.acharya.dikshanta.retail_store.units.dto.ProductUnitConversionResponse;

import java.util.List;

public interface ProductUnitConversionService {
    List<ProductUnitConversionResponse> getConversionsForProduct(Long productId);

    ProductUnitConversionResponse addConversionToProduct(Long productId, ProductUnitConversionRequest request);

    ProductUnitConversionResponse updateConversion(Long productId, Long conversionId, ProductUnitConversionRequest request);

    void deleteConversion(Long productId, Long conversionId);
}
