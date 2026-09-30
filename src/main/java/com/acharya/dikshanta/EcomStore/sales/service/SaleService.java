package com.acharya.dikshanta.EcomStore.sales.service;

import com.acharya.dikshanta.EcomStore.common.dto.request.PaginationRequest;
import com.acharya.dikshanta.EcomStore.common.dto.response.PagedResponse;
import com.acharya.dikshanta.EcomStore.sales.dto.request.SaleRequest;
import com.acharya.dikshanta.EcomStore.sales.dto.response.SaleResponse;
import com.acharya.dikshanta.EcomStore.sales.model.Sale;

public interface SaleService {
    SaleResponse createSale(SaleRequest saleRequest);

    Sale deleteSale(Long id);

    PagedResponse<Sale> getAllSales(PaginationRequest paginationRequest);
}
