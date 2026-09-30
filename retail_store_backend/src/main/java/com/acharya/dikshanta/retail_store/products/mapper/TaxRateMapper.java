package com.acharya.dikshanta.retail_store.products.mapper;

import com.acharya.dikshanta.retail_store.products.dto.request.TaxRateRequest;
import com.acharya.dikshanta.retail_store.products.dto.response.TaxRateResponse;
import com.acharya.dikshanta.retail_store.products.model.TaxRate;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TaxRateMapper {
    @Mapping(target = "id", ignore = true)
    TaxRate toEntity(TaxRateRequest request);

    TaxRateResponse toResponse(TaxRate taxRate);
}
