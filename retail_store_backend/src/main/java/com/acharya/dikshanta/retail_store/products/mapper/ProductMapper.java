package com.acharya.dikshanta.retail_store.products.mapper;

import com.acharya.dikshanta.retail_store.products.dto.request.ProductCreateRequest;
import com.acharya.dikshanta.retail_store.products.dto.response.ProductResponse;
import com.acharya.dikshanta.retail_store.products.model.Product;
import com.acharya.dikshanta.retail_store.units.mapper.ProductUnitConversionMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {ProductUnitConversionMapper.class})
public interface ProductMapper {
    @Mapping(target = "categoryName", source = "category.name")
    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "stock", source = "inventory.stock")
    @Mapping(target = "baseUnitId", source = "baseUnit.id")
    @Mapping(target = "baseUnitName", source = "baseUnit.name")
    @Mapping(target = "baseUnitSymbol", source = "baseUnit.symbol")
    @Mapping(target = "taxRateId", source = "taxRate.id")
    @Mapping(target = "taxRate", source = "taxRate.rate")
    @Mapping(target = "conversions", source = "unitConversions")
    ProductResponse toProductResponse(Product product);

    @Mapping(target = "category", ignore = true)
    @Mapping(target = "baseUnit", ignore = true)
    @Mapping(target = "taxRate", ignore = true)
    @Mapping(target = "inventory", ignore = true)
    @Mapping(target = "unitConversions", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "active", ignore = true)
    Product toProduct(ProductCreateRequest productCreateRequest);
}
