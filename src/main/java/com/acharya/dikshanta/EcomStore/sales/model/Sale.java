package com.acharya.dikshanta.EcomStore.sales.model;

import com.acharya.dikshanta.EcomStore.common.model.BaseEntity;
import com.acharya.dikshanta.EcomStore.payment.model.Payment;
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
    @Column(name = "invoice_number", nullable = false, unique = true)
    UUID invoiceNumber = UUID.randomUUID();

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

}
