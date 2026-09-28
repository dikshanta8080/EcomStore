package com.acharya.dikshanta.EcomStore.products.mapper;

import com.acharya.dikshanta.EcomStore.products.dto.request.CategoryRequest;
import com.acharya.dikshanta.EcomStore.products.dto.response.CategoryResponse;
import com.acharya.dikshanta.EcomStore.products.model.Category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    @Mapping(target = "id", ignore = true)
    Category toEntity(CategoryRequest request);

    CategoryResponse toResponse(Category category);
}
