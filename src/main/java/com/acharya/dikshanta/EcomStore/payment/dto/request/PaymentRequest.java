package com.acharya.dikshanta.EcomStore.payment.dto.request;

import lombok.Builder;

import java.util.List;

@Builder
public record PaymentRequest(
        Long saleId,
        List<SubPaymentRequest> subPayments
) {
}
