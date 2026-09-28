package com.acharya.dikshanta.EcomStore.products.service.impl;

import com.acharya.dikshanta.EcomStore.common.exceptions.DuplicateResourceException;
import com.acharya.dikshanta.EcomStore.common.exceptions.ResourceNotFoundException;
import com.acharya.dikshanta.EcomStore.products.dto.request.CategoryRequest;
import com.acharya.dikshanta.EcomStore.products.dto.response.CategoryResponse;
import com.acharya.dikshanta.EcomStore.products.mapper.CategoryMapper;
import com.acharya.dikshanta.EcomStore.products.model.Category;
import com.acharya.dikshanta.EcomStore.products.repository.CategoryRepository;
import com.acharya.dikshanta.EcomStore.products.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {
    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        checkIfCategoryExists(request.name());
        Category category = categoryMapper.toEntity(request);
        return categoryMapper.toResponse(categoryRepository.save(category));
    }

    @Transactional(readOnly = true)
    @Override
    public List<CategoryResponse> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        return categories.stream().map(categoryMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    @Override
    public CategoryResponse getCategoryById(Long id) {
        Category category = findCategoryById(id);
        return categoryMapper.toResponse(category);
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = findCategoryById(id);
        updateCategoryFields(category, request);
        return categoryMapper.toResponse(category);
    }

    @Transactional
    @Override
    public void deleteCategory(Long id) {
        Category category = findCategoryById(id);
        categoryRepository.delete(category);
    }

    private Category findCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    }

    private void checkIfCategoryExists(String name) {
        if (categoryRepository.existsByName(name)) {
            throw new DuplicateResourceException("Category already found with name: " + name);
        }
    }

    private void updateCategoryFields(Category category, CategoryRequest request) {
        if (request.name() != null) {
            category.setName(request.name());
        }
        if (request.description() != null) {
            category.setDescription(request.description());
        }
    }
}
