package com.acharya.dikshanta.EcomStore.products.specifications;

import com.acharya.dikshanta.EcomStore.products.dto.request.ProductFilterRequest;
import com.acharya.dikshanta.EcomStore.products.model.Product;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class ProductSpecification {

    public Specification<Product> getSpecification(ProductFilterRequest filterRequest) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filterRequest.nameOrCategoryName() != null
                    && !filterRequest.nameOrCategoryName().isBlank()) {

                String search = "%" + filterRequest.nameOrCategoryName().toLowerCase() + "%";

                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), search),
                        cb.like(cb.lower(root.get("category").get("name")), search)
                ));
            }
            if (filterRequest.sku() != null && !filterRequest.sku().isBlank()) {
                String skuSearch = "%" + filterRequest.sku().toLowerCase().trim() + "%";
                predicates.add(cb.like(cb.lower(root.get("sku")), skuSearch));
            }
            if (filterRequest.categoryId() != null) {
                predicates.add(cb.equal(root.get("category").get("id"), filterRequest.categoryId()));
            }
            if (filterRequest.minPrice() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), filterRequest.minPrice()));
            }
            if (filterRequest.maxPrice() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), filterRequest.maxPrice()));
            }
            if (filterRequest.minStock() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("inventory").get("stock"), java.math.BigDecimal.valueOf(filterRequest.minStock())));
            }
            if (filterRequest.maxStock() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("inventory").get("stock"), java.math.BigDecimal.valueOf(filterRequest.maxStock())));
            }
            if (filterRequest.active() != null) {
                predicates.add(cb.equal(root.get("active"), filterRequest.active()));
            } else {
               
                predicates.add(cb.or(
                        cb.isNull(root.get("active")),
                        cb.isTrue(root.get("active"))
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}