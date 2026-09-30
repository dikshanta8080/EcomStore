package com.acharya.dikshanta.retail_store.payment.dto.response;

import com.acharya.dikshanta.retail_store.payment.enums.PaymentStatus;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Builder
public record PaymentResponse(
        UUID paymentId,
        Long saleId,
        BigDecimal totalAmount,
        BigDecimal paidAmount,
        PaymentStatus status,
        LocalDateTime paymentTime,
        List<SubPaymentResponse> subPayments
) {
}
