package com.acharya.dikshanta.EcomStore.payment.service.impl;

import com.acharya.dikshanta.EcomStore.common.dto.request.PaginationRequest;
import com.acharya.dikshanta.EcomStore.common.dto.response.PagedResponse;
import com.acharya.dikshanta.EcomStore.common.exceptions.BusinessException;
import com.acharya.dikshanta.EcomStore.common.exceptions.ResourceNotFoundException;
import com.acharya.dikshanta.EcomStore.payment.dto.request.PaymentFilterRequest;
import com.acharya.dikshanta.EcomStore.payment.dto.request.PaymentRequest;
import com.acharya.dikshanta.EcomStore.payment.dto.request.SubPaymentRequest;
import com.acharya.dikshanta.EcomStore.payment.dto.response.PaymentResponse;
import com.acharya.dikshanta.EcomStore.payment.dto.response.PaymentSummaryResponse;
import com.acharya.dikshanta.EcomStore.payment.enums.PaymentMethod;
import com.acharya.dikshanta.EcomStore.payment.enums.PaymentStatus;
import com.acharya.dikshanta.EcomStore.payment.mapper.PaymentMapper;
import com.acharya.dikshanta.EcomStore.payment.model.Payment;
import com.acharya.dikshanta.EcomStore.payment.model.SubPayment;
import com.acharya.dikshanta.EcomStore.payment.repository.PaymentRepository;
import com.acharya.dikshanta.EcomStore.payment.service.PaymentService;
import com.acharya.dikshanta.EcomStore.payment.specifications.PaymentSpecification;
import com.acharya.dikshanta.EcomStore.sales.enums.SaleStatus;
import com.acharya.dikshanta.EcomStore.sales.model.Sale;
import com.acharya.dikshanta.EcomStore.sales.repository.SalesRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {
    private final PaymentRepository paymentRepository;
    private final SalesRepository salesRepository;
    private final PaymentMapper paymentMapper;
    private final PaymentSpecification paymentSpecification;

    @Override
    @Transactional
    public PaymentResponse processPayment(PaymentRequest paymentRequest) {
        if (paymentRequest == null || paymentRequest.saleId() == null) {
            throw new BusinessException("Sale ID cannot be null for payment processing");
        }

        if (paymentRequest.subPayments() == null || paymentRequest.subPayments().isEmpty()) {
            throw new BusinessException("At least one payment method with amount is required");
        }

        Sale sale = salesRepository.findById(paymentRequest.saleId())
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found with id: " + paymentRequest.saleId()));

        if (sale.getStatus() == SaleStatus.COMPLETED) {
            throw new BusinessException("Sale #" + sale.getId() + " is already marked as COMPLETED and paid");
        }

        if (sale.getStatus() == SaleStatus.CANCELLED) {
            throw new BusinessException("Cannot process payment for a CANCELLED sale");
        }

        BigDecimal totalPaid = BigDecimal.ZERO;
        for (SubPaymentRequest subReq : paymentRequest.subPayments()) {
            if (subReq.amount() == null || subReq.amount().compareTo(BigDecimal.ZERO) <= 0) {
                throw new BusinessException("Payment amount for method " + subReq.paymentMethod() + " must be greater than zero");
            }
            if (subReq.paymentMethod() == null) {
                throw new BusinessException("Payment method must be specified");
            }
            totalPaid = totalPaid.add(subReq.amount());
        }

        if (totalPaid.compareTo(sale.getTotal()) < 0) {
            throw new BusinessException("Insufficient payment amount. Total required: " + sale.getTotal() +
                    ", Total paid: " + totalPaid);
        }

        Payment payment = paymentMapper.toEntity(paymentRequest);
        payment.setSale(sale);
        payment.setTotalAmount(sale.getTotal());
        payment.setPaidAmount(totalPaid);
        payment.setStatus(PaymentStatus.COMPLETED);

        Payment savedPayment = paymentRepository.save(payment);

        sale.setStatus(SaleStatus.COMPLETED);
        sale.addPayment(savedPayment);
        salesRepository.save(sale);

        log.info("Payment successful for sale id {}. Total: {}, Paid: {}", sale.getId(), sale.getTotal(), totalPaid);

        return paymentMapper.toResponse(savedPayment);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentBySaleId(Long saleId) {
        Payment payment = paymentRepository.findFirstBySaleIdOrderByCreatedAtDesc(saleId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for sale id: " + saleId));
        return paymentMapper.toResponse(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<PaymentResponse> getAllPayments(PaginationRequest paginationRequest, PaymentFilterRequest filterRequest) {
        Pageable pageable = (paginationRequest != null)
                ? paginationRequest.toPageable()
                : PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"));
        Specification<Payment> spec = paymentSpecification.getSpecification(filterRequest);
        Page<Payment> paymentsPage = paymentRepository.findAll(spec, pageable);
        return PagedResponse.from(paymentsPage.map(paymentMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentSummaryResponse getPaymentSummary() {
        List<Payment> allPayments = paymentRepository.findAll();

        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal cashTotal = BigDecimal.ZERO;
        BigDecimal esewaTotal = BigDecimal.ZERO;
        BigDecimal khaltiTotal = BigDecimal.ZERO;
        BigDecimal cardTotal = BigDecimal.ZERO;
        BigDecimal mobileBankingTotal = BigDecimal.ZERO;
        Map<String, BigDecimal> methodBreakdown = new HashMap<>();

        for (Payment payment : allPayments) {
            if (payment.getStatus() == PaymentStatus.COMPLETED) {
                totalRevenue = totalRevenue.add(payment.getTotalAmount() != null ? payment.getTotalAmount() : BigDecimal.ZERO);
                if (payment.getSubPayments() != null) {
                    for (SubPayment sub : payment.getSubPayments()) {
                        if (sub.getAmount() == null) continue;
                        PaymentMethod method = sub.getPaymentMethod();
                        String methodName = method != null ? method.name() : "OTHER";
                        methodBreakdown.put(methodName, methodBreakdown.getOrDefault(methodName, BigDecimal.ZERO).add(sub.getAmount()));

                        if (method == PaymentMethod.CASH) {
                            cashTotal = cashTotal.add(sub.getAmount());
                        } else if (method == PaymentMethod.ESEWA) {
                            esewaTotal = esewaTotal.add(sub.getAmount());
                        } else if (method == PaymentMethod.KHALTI || method == PaymentMethod.KHALI) {
                            khaltiTotal = khaltiTotal.add(sub.getAmount());
                        } else if (method == PaymentMethod.CARD) {
                            cardTotal = cardTotal.add(sub.getAmount());
                        } else if (method == PaymentMethod.MOBILE_BANKING) {
                            mobileBankingTotal = mobileBankingTotal.add(sub.getAmount());
                        }
                    }
                }
            }
        }

        return PaymentSummaryResponse.builder()
                .totalRevenue(totalRevenue)
                .totalTransactions(allPayments.size())
                .cashTotal(cashTotal)
                .esewaTotal(esewaTotal)
                .khaltiTotal(khaltiTotal)
                .cardTotal(cardTotal)
                .mobileBankingTotal(mobileBankingTotal)
                .methodBreakdown(methodBreakdown)
                .build();
    }
}
