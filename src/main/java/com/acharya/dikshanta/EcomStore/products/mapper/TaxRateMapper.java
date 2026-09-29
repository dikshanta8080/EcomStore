package com.acharya.dikshanta.EcomStore.products.mapper;

import com.acharya.dikshanta.EcomStore.products.dto.request.TaxRateRequest;
import com.acharya.dikshanta.EcomStore.products.dto.response.TaxRateResponse;
import com.acharya.dikshanta.EcomStore.products.model.TaxRate;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TaxRateMapper {
    @Mapping(target = "id", ignore = true)
    TaxRate toEntity(TaxRateRequest request);

    TaxRateResponse toResponse(TaxRate taxRate);
}
