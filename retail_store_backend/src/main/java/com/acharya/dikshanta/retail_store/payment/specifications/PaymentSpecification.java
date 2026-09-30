package com.acharya.dikshanta.retail_store.payment.specifications;

import com.acharya.dikshanta.retail_store.payment.dto.request.PaymentFilterRequest;
import com.acharya.dikshanta.retail_store.payment.model.Payment;
import com.acharya.dikshanta.retail_store.payment.model.SubPayment;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class PaymentSpecification {

    public Specification<Payment> getSpecification(PaymentFilterRequest filterRequest) {
        return (root, query, cb) -> {
            if (filterRequest == null) {
                return cb.conjunction();
            }

            List<Predicate> predicates = new ArrayList<>();
            Join<Payment, SubPayment> subJoin = null;

            if (filterRequest.paymentMethod() != null) {
                subJoin = root.join("subPayments", JoinType.LEFT);
                predicates.add(cb.equal(subJoin.get("paymentMethod"), filterRequest.paymentMethod()));
            }

            if (filterRequest.search() != null && !filterRequest.search().isBlank()) {
                if (subJoin == null) {
                    subJoin = root.join("subPayments", JoinType.LEFT);
                }
                String search = "%" + filterRequest.search().trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(subJoin.get("transactionId")), search),
                        cb.like(cb.lower(root.get("sale").get("invoiceNumber").as(String.class)), search)
                ));
            }

            if (filterRequest.saleId() != null) {
                predicates.add(cb.equal(root.get("sale").get("id"), filterRequest.saleId()));
            }

            if (filterRequest.status() != null) {
                predicates.add(cb.equal(root.get("status"), filterRequest.status()));
            }

            if (filterRequest.minAmount() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("paidAmount"), filterRequest.minAmount()));
            }

            if (filterRequest.maxAmount() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("paidAmount"), filterRequest.maxAmount()));
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
