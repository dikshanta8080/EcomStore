package com.acharya.dikshanta.EcomStore.sales.specifications;

import com.acharya.dikshanta.EcomStore.sales.dto.request.SaleFilterRequest;
import com.acharya.dikshanta.EcomStore.sales.model.Sale;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class SaleSpecification {

    public Specification<Sale> getSpecification(SaleFilterRequest filterRequest) {
        return (root, query, cb) -> {
            if (filterRequest == null) {
                return cb.conjunction();
            }

            List<Predicate> predicates = new ArrayList<>();

            if (filterRequest.search() != null && !filterRequest.search().isBlank()) {
                String search = "%" + filterRequest.search().trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("invoiceNumber").as(String.class)), search)
                ));
            }

            if (filterRequest.invoiceNumber() != null) {
                predicates.add(cb.equal(root.get("invoiceNumber"), filterRequest.invoiceNumber()));
            }

            if (filterRequest.status() != null) {
                predicates.add(cb.equal(root.get("status"), filterRequest.status()));
            }

            if (filterRequest.minTotal() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("total"), filterRequest.minTotal()));
            }

            if (filterRequest.maxTotal() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("total"), filterRequest.maxTotal()));
            }

            if (filterRequest.startDate() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), filterRequest.startDate().atStartOfDay()));
            }

            if (filterRequest.endDate() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), filterRequest.endDate().atTime(LocalTime.MAX)));
            }

            query.distinct(true);
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
