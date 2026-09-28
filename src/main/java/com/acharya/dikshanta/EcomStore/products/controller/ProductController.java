package com.acharya.dikshanta.EcomStore.products.controller;

import com.acharya.dikshanta.EcomStore.common.dto.request.PaginationRequest;
import com.acharya.dikshanta.EcomStore.common.dto.response.ApiResponse;
import com.acharya.dikshanta.EcomStore.common.dto.response.PagedResponse;
import com.acharya.dikshanta.EcomStore.products.dto.request.ProductCreateRequest;
import com.acharya.dikshanta.EcomStore.products.dto.request.ProductUpdateRequest;
import com.acharya.dikshanta.EcomStore.products.dto.response.ProductResponse;
import com.acharya.dikshanta.EcomStore.products.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/products")
public class ProductController {
    private final ProductService productService;

    @PostMapping
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(
            @Valid @RequestBody ProductCreateRequest productCreateRequest) {
        var response = productService.createProduct(productCreateRequest);
        return ResponseEntity.ok(ApiResponse.success(response));

    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<ProductResponse>>> getAllProducts(
            @ModelAttribute PaginationRequest paginationRequest) {
        var response = productService.getAllProducts(paginationRequest.toPageable());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(@PathVariable Long id) {
        var response = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> deleteProduct(@PathVariable Long id) {
        var response = productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductUpdateRequest productUpdateRequest) {
        var response = productService.updateProduct(id, productUpdateRequest);
        return ResponseEntity.ok(ApiResponse.success(response));
    }


}
