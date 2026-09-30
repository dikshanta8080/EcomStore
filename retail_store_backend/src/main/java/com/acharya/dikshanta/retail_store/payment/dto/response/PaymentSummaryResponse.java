package com.acharya.dikshanta.retail_store.payment.dto.response;

import lombok.Builder;

import java.math.BigDecimal;
import java.util.Map;

@Builder
public record PaymentSummaryResponse(
        BigDecimal totalRevenue,
        long totalTransactions,
        BigDecimal cashTotal,
        BigDecimal esewaTotal,
        BigDecimal khaltiTotal,
        BigDecimal cardTotal,
        BigDecimal mobileBankingTotal,
        Map<String, BigDecimal> methodBreakdown
) {
}
