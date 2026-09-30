package com.acharya.dikshanta.retail_store.products.service;

import com.acharya.dikshanta.retail_store.common.dto.response.PagedResponse;
import com.acharya.dikshanta.retail_store.products.dto.request.ProductCreateRequest;
import com.acharya.dikshanta.retail_store.products.dto.request.ProductFilterRequest;
import com.acharya.dikshanta.retail_store.products.dto.request.ProductUpdateRequest;
import com.acharya.dikshanta.retail_store.products.dto.response.ProductResponse;
import org.springframework.data.domain.Pageable;

public interface ProductService {
    ProductResponse createProduct(ProductCreateRequest productCreateRequest);

    ProductResponse updateProduct(Long id, ProductUpdateRequest productUpdateRequest);

    ProductResponse deleteProduct(Long id);

    ProductResponse restoreProduct(Long id);

    ProductResponse getProductById(Long id);

    PagedResponse<ProductResponse> getAllProducts(Pageable pageable, ProductFilterRequest filterRequest);

    com.acharya.dikshanta.retail_store.products.dto.response.ProductSummaryResponse getProductSummary();

    void seedSampleData();
}
