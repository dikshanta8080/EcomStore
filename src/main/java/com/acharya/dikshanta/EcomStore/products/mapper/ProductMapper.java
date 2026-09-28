package com.acharya.dikshanta.EcomStore.products.mapper;

import com.acharya.dikshanta.EcomStore.products.dto.request.ProductCreateRequest;
import com.acharya.dikshanta.EcomStore.products.dto.response.ProductResponse;
import com.acharya.dikshanta.EcomStore.products.model.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductMapper {
    @Mapping(target = "categoryName", source = "category.name")
    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "stock", source = "inventory.stock", defaultValue = "0L")
    ProductResponse toProductResponse(Product product);

    @Mapping(target = "category", ignore = true)
    @Mapping(target = "inventory", ignore = true)
    @Mapping(target = "id", ignore = true)
    Product toProduct(ProductCreateRequest productCreateRequest);
}
