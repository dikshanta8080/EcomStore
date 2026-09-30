package com.acharya.dikshanta.retail_store.payment.dto.request;

import com.acharya.dikshanta.retail_store.payment.enums.PaymentMethod;
import lombok.Builder;

import java.math.BigDecimal;

@Builder
public record SubPaymentRequest(
        PaymentMethod paymentMethod,
        BigDecimal amount,
        String transactionId
) {
}
