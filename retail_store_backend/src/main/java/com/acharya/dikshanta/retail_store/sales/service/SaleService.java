package com.acharya.dikshanta.retail_store.sales.service;

import com.acharya.dikshanta.retail_store.common.dto.request.PaginationRequest;
import com.acharya.dikshanta.retail_store.common.dto.response.PagedResponse;
import com.acharya.dikshanta.retail_store.sales.dto.request.SaleFilterRequest;
import com.acharya.dikshanta.retail_store.sales.dto.request.SaleRequest;
import com.acharya.dikshanta.retail_store.sales.dto.response.SaleResponse;

public interface SaleService {
    SaleResponse createSale(SaleRequest saleRequest);

    SaleResponse getSaleById(Long id);

    PagedResponse<SaleResponse> getAllSales(PaginationRequest paginationRequest, SaleFilterRequest filterRequest);

    SaleResponse cancelSale(Long id);
}
