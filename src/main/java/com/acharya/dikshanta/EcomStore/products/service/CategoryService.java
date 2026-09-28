package com.acharya.dikshanta.EcomStore.products.service;

import com.acharya.dikshanta.EcomStore.products.dto.request.CategoryRequest;
import com.acharya.dikshanta.EcomStore.products.dto.response.CategoryResponse;

import java.util.List;

public interface CategoryService {
    CategoryResponse createCategory(CategoryRequest request);

    List<CategoryResponse> getAllCategories();

    CategoryResponse getCategoryById(Long id);

    CategoryResponse updateCategory(Long id, CategoryRequest request);

    void deleteCategory(Long id);
}
