package com.acharya.dikshanta.EcomStore.products.service;

import com.acharya.dikshanta.EcomStore.products.dto.request.TaxRateRequest;
import com.acharya.dikshanta.EcomStore.products.dto.response.TaxRateResponse;

import java.util.List;

public interface TaxRateService {
    TaxRateResponse createTaxRate(TaxRateRequest request);

    TaxRateResponse updateTaxRate(Long id, TaxRateRequest request);

    void deleteTaxRate(Long id);

    TaxRateResponse getTaxRate(Long id);

    List<TaxRateResponse> getAllTaxRates();

}
