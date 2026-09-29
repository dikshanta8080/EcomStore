package com.acharya.dikshanta.EcomStore.inventory.specifications;

import com.acharya.dikshanta.EcomStore.inventory.dto.request.InventoryMovementFilterRequest;
import com.acharya.dikshanta.EcomStore.inventory.model.InventoryMovement;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class InventoryMovementSpecification {

    public Specification<InventoryMovement> getSpecification(InventoryMovementFilterRequest filterRequest) {
        return (root, query, cb) -> {
            if (filterRequest == null) {
                return cb.conjunction();
            }

            List<Predicate> predicates = new ArrayList<>();

            String search = null;
            if (filterRequest.search() != null && !filterRequest.search().isBlank()) {
                search = filterRequest.search().trim().toLowerCase();
            } else if (filterRequest.nameOrCategoryName() != null && !filterRequest.nameOrCategoryName().isBlank()) {
                search = filterRequest.nameOrCategoryName().trim().toLowerCase();
            }

            if (search != null) {
                String searchPattern = "%" + search + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("inventory").get("product").get("name")), searchPattern),
                        cb.like(cb.lower(root.get("inventory").get("product").get("sku")), searchPattern),
                        cb.like(cb.lower(root.get("inventory").get("product").get("category").get("name")), searchPattern)
                ));
            }

            if (filterRequest.sku() != null && !filterRequest.sku().isBlank()) {
                String skuPattern = "%" + filterRequest.sku().trim().toLowerCase() + "%";
                predicates.add(cb.like(cb.lower(root.get("inventory").get("product").get("sku")), skuPattern));
            }

            if (filterRequest.productId() != null) {
                predicates.add(cb.equal(root.get("inventory").get("product").get("id"), filterRequest.productId()));
            }

            if (filterRequest.categoryId() != null) {
                predicates.add(cb.equal(root.get("inventory").get("product").get("category").get("id"), filterRequest.categoryId()));
            }

            if (filterRequest.movementType() != null) {
                predicates.add(cb.equal(root.get("movementType"), filterRequest.movementType()));
            }

            if (filterRequest.unitId() != null) {
                predicates.add(cb.equal(root.get("unit").get("id"), filterRequest.unitId()));
            }

            if (filterRequest.minQuantity() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("quantity"), filterRequest.minQuantity()));
            }

            if (filterRequest.maxQuantity() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("quantity"), filterRequest.maxQuantity()));
            }

            if (filterRequest.minTotalAmount() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("totalAmount"), filterRequest.minTotalAmount()));
            }

            if (filterRequest.maxTotalAmount() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("totalAmount"), filterRequest.maxTotalAmount()));
            }

            LocalDate start = filterRequest.startDate() != null ? filterRequest.startDate() : filterRequest.fromDate();
            LocalDate end = filterRequest.endDate() != null ? filterRequest.endDate() : filterRequest.toDate();

            if (start != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), start.atStartOfDay()));
            }

            if (end != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), end.atTime(LocalTime.MAX)));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
