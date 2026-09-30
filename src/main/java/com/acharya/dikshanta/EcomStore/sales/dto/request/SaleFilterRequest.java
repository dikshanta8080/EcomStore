package com.acharya.dikshanta.EcomStore.sales.dto.request;

import com.acharya.dikshanta.EcomStore.sales.enums.SaleStatus;
import org.springframework.format.annotation.DateTimeFormat;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record SaleFilterRequest(
        String search,
        UUID invoiceNumber,
        SaleStatus status,
        BigDecimal minTotal,
        BigDecimal maxTotal,
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
) {
}
