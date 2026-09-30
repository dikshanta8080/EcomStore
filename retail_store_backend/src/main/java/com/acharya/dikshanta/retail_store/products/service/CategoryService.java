package com.acharya.dikshanta.retail_store.products.service;

import com.acharya.dikshanta.retail_store.products.dto.request.CategoryRequest;
import com.acharya.dikshanta.retail_store.products.dto.response.CategoryResponse;

import java.util.List;

public interface CategoryService {
    CategoryResponse createCategory(CategoryRequest request);

    List<CategoryResponse> getAllCategories();

    CategoryResponse getCategoryById(Long id);

    CategoryResponse updateCategory(Long id, CategoryRequest request);

    void deleteCategory(Long id);
}
