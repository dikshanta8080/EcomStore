package com.acharya.dikshanta.EcomStore.payment.dto.request;

import com.acharya.dikshanta.EcomStore.payment.enums.PaymentMethod;
import com.acharya.dikshanta.EcomStore.payment.enums.PaymentStatus;
import org.springframework.format.annotation.DateTimeFormat;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PaymentFilterRequest(
        String search,
        Long saleId,
        PaymentStatus status,
        PaymentMethod paymentMethod,
        BigDecimal minAmount,
        BigDecimal maxAmount,
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
) {
}
