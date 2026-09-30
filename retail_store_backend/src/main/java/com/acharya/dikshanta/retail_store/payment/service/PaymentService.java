package com.acharya.dikshanta.retail_store.payment.service;

import com.acharya.dikshanta.retail_store.common.dto.request.PaginationRequest;
import com.acharya.dikshanta.retail_store.common.dto.response.PagedResponse;
import com.acharya.dikshanta.retail_store.payment.dto.request.PaymentFilterRequest;
import com.acharya.dikshanta.retail_store.payment.dto.request.PaymentRequest;
import com.acharya.dikshanta.retail_store.payment.dto.response.PaymentResponse;
import com.acharya.dikshanta.retail_store.payment.dto.response.PaymentSummaryResponse;

public interface PaymentService {
    PaymentResponse processPayment(PaymentRequest paymentRequest);

    PaymentResponse getPaymentBySaleId(Long saleId);

    PagedResponse<PaymentResponse> getAllPayments(PaginationRequest paginationRequest, PaymentFilterRequest filterRequest);

    PaymentSummaryResponse getPaymentSummary();
}
