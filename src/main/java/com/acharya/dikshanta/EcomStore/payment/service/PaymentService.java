package com.acharya.dikshanta.EcomStore.payment.service;

import com.acharya.dikshanta.EcomStore.common.dto.request.PaginationRequest;
import com.acharya.dikshanta.EcomStore.common.dto.response.PagedResponse;
import com.acharya.dikshanta.EcomStore.payment.dto.request.PaymentFilterRequest;
import com.acharya.dikshanta.EcomStore.payment.dto.request.PaymentRequest;
import com.acharya.dikshanta.EcomStore.payment.dto.response.PaymentResponse;
import com.acharya.dikshanta.EcomStore.payment.dto.response.PaymentSummaryResponse;

public interface PaymentService {
    PaymentResponse processPayment(PaymentRequest paymentRequest);

    PaymentResponse getPaymentBySaleId(Long saleId);

    PagedResponse<PaymentResponse> getAllPayments(PaginationRequest paginationRequest, PaymentFilterRequest filterRequest);

    PaymentSummaryResponse getPaymentSummary();
}
