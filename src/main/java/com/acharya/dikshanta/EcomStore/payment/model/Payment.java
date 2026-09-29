package com.acharya.dikshanta.EcomStore.payment.model;

import com.acharya.dikshanta.EcomStore.payment.enums.PaymentStatus;
import com.acharya.dikshanta.EcomStore.sales.model.Sale;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.UuidGenerator;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "payments")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Payment {

    @Id
    @UuidGenerator
    private UUID id;

    @Column(name = "total_amount", nullable = false)
    private BigDecimal totalAmount;

    @Column(name = "paid_amount", nullable = false)
    @Builder.Default
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.COMPLETED;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sale_id", nullable = false)
    private Sale sale;

    @OneToMany(mappedBy = "payment", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SubPayment> subPayments = new ArrayList<>();

    public void addSubPayment(SubPayment subPayment) {
        subPayments.add(subPayment);
        subPayment.setPayment(this);
        calculatePaidAmount();
    }

    public void removeSubPayment(SubPayment subPayment) {
        subPayments.remove(subPayment);
        subPayment.setPayment(null);
        calculatePaidAmount();
    }

    public void calculatePaidAmount() {
        this.paidAmount = subPayments.stream()
                .map(SubPayment::getAmount)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal getAmount() {
        return totalAmount != null ? totalAmount : paidAmount;
    }
}