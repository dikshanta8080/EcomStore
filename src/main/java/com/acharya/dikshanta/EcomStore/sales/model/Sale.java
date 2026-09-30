package com.acharya.dikshanta.EcomStore.sales.model;

import com.acharya.dikshanta.EcomStore.common.model.BaseEntity;
import com.acharya.dikshanta.EcomStore.payment.model.Payment;
import com.acharya.dikshanta.EcomStore.sales.enums.SaleStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "sales")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@SuperBuilder
public class Sale extends BaseEntity {
    @Builder.Default
    @Column(name = "invoice_number", nullable = false, unique = true)
    UUID invoiceNumber = UUID.randomUUID();

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private SaleStatus status = SaleStatus.PENDING;

    @Column(name = "sub_total", nullable = false)
    BigDecimal subTotal;

    @Column(name = "discount", nullable = false)
    BigDecimal discount;

    @Column(name = "tax", nullable = false)
    BigDecimal tax;

    @Column(name = "total", nullable = false)
    BigDecimal total;

    @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SaleItem> saleItems = new ArrayList<>();

    @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Payment> payments = new ArrayList<>();

    public void calculateTotal() {
        total = subTotal.subtract(discount).add(tax);
    }

    public void calculateTax() {
        tax = saleItems.stream().map(SaleItem::getTax).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public void calculateSubTotal() {
        subTotal = saleItems.stream()
                .map(SaleItem::getTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public void addSaleItem(SaleItem saleItem) {
        saleItems.add(saleItem);
        saleItem.setSale(this);
        calculateTotal();
    }

    public void removeSaleItem(SaleItem saleItem) {
        saleItems.remove(saleItem);
        saleItem.setSale(null);
        calculateTotal();
    }

    public void addPayment(Payment payment) {
        payments.add(payment);
        payment.setSale(this);
    }

    public void removePayment(Payment payment) {
        payments.remove(payment);
        payment.setSale(null);
    }
}
