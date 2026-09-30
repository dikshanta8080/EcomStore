package com.acharya.dikshanta.EcomStore.sales.service;

import com.acharya.dikshanta.EcomStore.common.dto.request.PaginationRequest;
import com.acharya.dikshanta.EcomStore.common.dto.response.PagedResponse;
import com.acharya.dikshanta.EcomStore.sales.dto.request.SaleFilterRequest;
import com.acharya.dikshanta.EcomStore.sales.dto.request.SaleRequest;
import com.acharya.dikshanta.EcomStore.sales.dto.response.SaleResponse;

public interface SaleService {
    SaleResponse createSale(SaleRequest saleRequest);

    SaleResponse getSaleById(Long id);

    PagedResponse<SaleResponse> getAllSales(PaginationRequest paginationRequest, SaleFilterRequest filterRequest);

    SaleResponse cancelSale(Long id);
}
