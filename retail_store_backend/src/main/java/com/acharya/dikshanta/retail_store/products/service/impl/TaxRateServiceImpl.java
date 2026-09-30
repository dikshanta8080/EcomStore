package com.acharya.dikshanta.retail_store.products.service.impl;

import com.acharya.dikshanta.retail_store.common.exceptions.BusinessException;
import com.acharya.dikshanta.retail_store.common.exceptions.DuplicateResourceException;
import com.acharya.dikshanta.retail_store.common.exceptions.ResourceNotFoundException;
import com.acharya.dikshanta.retail_store.products.dto.request.TaxRateRequest;
import com.acharya.dikshanta.retail_store.products.dto.response.TaxRateResponse;
import com.acharya.dikshanta.retail_store.products.mapper.TaxRateMapper;
import com.acharya.dikshanta.retail_store.products.model.TaxRate;
import com.acharya.dikshanta.retail_store.products.repository.ProductRepository;
import com.acharya.dikshanta.retail_store.products.repository.TaxRateRepository;
import com.acharya.dikshanta.retail_store.products.service.TaxRateService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaxRateServiceImpl implements TaxRateService {

    private final TaxRateRepository taxRateRepository;
    private final TaxRateMapper taxRateMapper;
    private final ProductRepository productRepository;

    @Override
    @Transactional
    public TaxRateResponse createTaxRate(TaxRateRequest request) {
        checkIfTaxRateExists(request.rate());
        TaxRate taxRate = taxRateMapper.toEntity(request);
        TaxRate saved = taxRateRepository.save(taxRate);
        return taxRateMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public TaxRateResponse updateTaxRate(Long id, TaxRateRequest request) {
        TaxRate taxRate = findTaxRateById(id);
        if (request.rate() != null && taxRate.getRate().compareTo(request.rate()) != 0) {
            checkIfTaxRateExists(request.rate());
            taxRate.setRate(request.rate());
        }
        TaxRate updated = taxRateRepository.save(taxRate);
        return taxRateMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void deleteTaxRate(Long id) {
        TaxRate taxRate = findTaxRateById(id);
        if (productRepository.existsByTaxRateId(id)) {
            throw new BusinessException("Cannot delete tax rate because it is assigned to existing products");
        }
        taxRateRepository.delete(taxRate);
    }

    @Override
    @Transactional(readOnly = true)
    public TaxRateResponse getTaxRate(Long id) {
        TaxRate taxRate = findTaxRateById(id);
        return taxRateMapper.toResponse(taxRate);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaxRateResponse> getAllTaxRates() {
        return taxRateRepository.findAll().stream()
                .map(taxRateMapper::toResponse)
                .toList();
    }

    private TaxRate findTaxRateById(Long id) {
        return taxRateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tax rate not found with id: " + id));
    }

    private void checkIfTaxRateExists(BigDecimal rate) {
        if (taxRateRepository.existsByRate(rate)) {
            throw new DuplicateResourceException("Tax rate already exists with rate: " + rate);
        }
    }
}
