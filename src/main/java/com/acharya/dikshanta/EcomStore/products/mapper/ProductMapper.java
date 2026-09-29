package com.acharya.dikshanta.EcomStore.products.mapper;

import com.acharya.dikshanta.EcomStore.products.dto.request.ProductCreateRequest;
import com.acharya.dikshanta.EcomStore.products.dto.response.ProductResponse;
import com.acharya.dikshanta.EcomStore.products.model.Product;
import com.acharya.dikshanta.EcomStore.units.mapper.ProductUnitConversionMapper;
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
    @Mapping(target = "conversions", source = "unitConversions")
    ProductResponse toProductResponse(Product product);

    @Mapping(target = "category", ignore = true)
    @Mapping(target = "baseUnit", ignore = true)
    @Mapping(target = "inventory", ignore = true)
    @Mapping(target = "unitConversions", ignore = true)
    @Mapping(target = "id", ignore = true)
    Product toProduct(ProductCreateRequest productCreateRequest);
}
