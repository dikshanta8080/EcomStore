package com.acharya.dikshanta.EcomStore.products.service;

import com.acharya.dikshanta.EcomStore.common.dto.response.PagedResponse;
import com.acharya.dikshanta.EcomStore.products.dto.request.ProductCreateRequest;
import com.acharya.dikshanta.EcomStore.products.dto.request.ProductUpdateRequest;
import com.acharya.dikshanta.EcomStore.products.dto.response.ProductResponse;
import org.springframework.data.domain.Pageable;

public interface ProductService {
    ProductResponse createProduct(ProductCreateRequest productCreateRequest);

    ProductResponse updateProduct(Long id, ProductUpdateRequest productUpdateRequest);

    ProductResponse deleteProduct(Long id);

    ProductResponse getProductById(Long id);

    PagedResponse<ProductResponse> getAllProducts(Pageable pageable);
}
