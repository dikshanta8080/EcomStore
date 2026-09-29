package com.acharya.dikshanta.EcomStore.payment.dto.request;

import com.acharya.dikshanta.EcomStore.payment.enums.PaymentMethod;
import lombok.Builder;

import java.math.BigDecimal;

@Builder
public record SubPaymentRequest(
        PaymentMethod paymentMethod,
        BigDecimal amount,
        String transactionId
) {
}
