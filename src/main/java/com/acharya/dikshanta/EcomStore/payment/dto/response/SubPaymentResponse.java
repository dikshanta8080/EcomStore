package com.acharya.dikshanta.EcomStore.payment.dto.response;

import com.acharya.dikshanta.EcomStore.payment.enums.PaymentMethod;
import com.acharya.dikshanta.EcomStore.payment.enums.PaymentStatus;
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
