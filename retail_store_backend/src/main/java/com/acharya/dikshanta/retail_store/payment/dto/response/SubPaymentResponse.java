package com.acharya.dikshanta.retail_store.payment.dto.response;

import com.acharya.dikshanta.retail_store.payment.enums.PaymentMethod;
import com.acharya.dikshanta.retail_store.payment.enums.PaymentStatus;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Builder
public record SubPaymentResponse(
        UUID id,
        PaymentMethod paymentMethod,
        BigDecimal amount,
        String transactionId,
        PaymentStatus status,
        LocalDateTime createdAt
) {
}
