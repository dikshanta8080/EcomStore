package com.acharya.dikshanta.EcomStore.payment.controller;

import com.acharya.dikshanta.EcomStore.common.dto.request.PaginationRequest;
import com.acharya.dikshanta.EcomStore.common.dto.response.ApiResponse;
import com.acharya.dikshanta.EcomStore.common.dto.response.PagedResponse;
import com.acharya.dikshanta.EcomStore.payment.dto.request.PaymentFilterRequest;
import com.acharya.dikshanta.EcomStore.payment.dto.request.PaymentRequest;
import com.acharya.dikshanta.EcomStore.payment.dto.response.PaymentResponse;
import com.acharya.dikshanta.EcomStore.payment.dto.response.PaymentSummaryResponse;
import com.acharya.dikshanta.EcomStore.payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/payments")
public class PaymentController {
    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<ApiResponse<PaymentResponse>> processPayment(@Valid @RequestBody PaymentRequest request) {
        PaymentResponse response = paymentService.processPayment(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Payment completed successfully"));
    }

    @GetMapping("/sale/{saleId}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentBySaleId(@PathVariable Long saleId) {
        PaymentResponse response = paymentService.getPaymentBySaleId(saleId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<PaymentResponse>>> getAllPayments(
            @ModelAttribute PaginationRequest paginationRequest,
            @ModelAttribute PaymentFilterRequest filterRequest) {
        PagedResponse<PaymentResponse> response = paymentService.getAllPayments(paginationRequest, filterRequest);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<PaymentSummaryResponse>> getPaymentSummary() {
        PaymentSummaryResponse response = paymentService.getPaymentSummary();
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
