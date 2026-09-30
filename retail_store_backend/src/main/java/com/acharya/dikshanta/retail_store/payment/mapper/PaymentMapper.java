package com.acharya.dikshanta.retail_store.payment.mapper;

import com.acharya.dikshanta.retail_store.payment.dto.request.PaymentRequest;
import com.acharya.dikshanta.retail_store.payment.dto.request.SubPaymentRequest;
import com.acharya.dikshanta.retail_store.payment.dto.response.PaymentResponse;
import com.acharya.dikshanta.retail_store.payment.dto.response.SubPaymentResponse;
import com.acharya.dikshanta.retail_store.payment.enums.PaymentStatus;
import com.acharya.dikshanta.retail_store.payment.model.Payment;
import com.acharya.dikshanta.retail_store.payment.model.SubPayment;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Component
public class PaymentMapper {

    public Payment toEntity(PaymentRequest request) {
        if (request == null) {
            return null;
        }

        Payment payment = Payment.builder()
                .status(PaymentStatus.COMPLETED)
                .build();

        List<SubPaymentRequest> subPaymentRequests = request.subPayments() != null
                ? request.subPayments()
                : Collections.emptyList();

        for (SubPaymentRequest subReq : subPaymentRequests) {
            SubPayment subPayment = toSubPayment(subReq);
            if (subPayment != null) {
                payment.addSubPayment(subPayment);
            }
        }

        payment.setTotalAmount(payment.getPaidAmount());

        return payment;
    }

    public SubPayment toSubPayment(SubPaymentRequest request) {
        if (request == null) {
            return null;
        }

        return SubPayment.builder()
                .paymentMethod(request.paymentMethod())
                .amount(request.amount())
                .transactionId(request.transactionId())
                .status(PaymentStatus.COMPLETED)
                .build();
    }

    public PaymentResponse toResponse(Payment payment) {
        if (payment == null) {
            return null;
        }

        List<SubPaymentResponse> subPaymentResponses = new ArrayList<>();
        if (payment.getSubPayments() != null) {
            for (SubPayment sub : payment.getSubPayments()) {
                subPaymentResponses.add(toSubPaymentResponse(sub));
            }
        }

        return PaymentResponse.builder()
                .paymentId(payment.getId())
                .saleId(payment.getSale() != null ? payment.getSale().getId() : null)
                .totalAmount(payment.getTotalAmount())
                .paidAmount(payment.getPaidAmount())
                .status(payment.getStatus())
                .paymentTime(payment.getCreatedAt() != null ? payment.getCreatedAt() : LocalDateTime.now())
                .subPayments(subPaymentResponses)
                .build();
    }

    public PaymentResponse toResponse(List<Payment> payments) {
        if (payments == null || payments.isEmpty()) {
            return null;
        }
        return toResponse(payments.get(0));
    }

    public List<PaymentResponse> toResponseList(List<Payment> payments) {
        if (payments == null) {
            return Collections.emptyList();
        }
        List<PaymentResponse> responses = new ArrayList<>();
        for (Payment payment : payments) {
            responses.add(toResponse(payment));
        }
        return responses;
    }

    public SubPaymentResponse toSubPaymentResponse(SubPayment subPayment) {
        if (subPayment == null) {
            return null;
        }

        return SubPaymentResponse.builder()
                .id(subPayment.getId())
                .paymentMethod(subPayment.getPaymentMethod())
                .amount(subPayment.getAmount())
                .transactionId(subPayment.getTransactionId())
                .status(subPayment.getStatus())
                .createdAt(subPayment.getCreatedAt())
                .build();
    }
}
