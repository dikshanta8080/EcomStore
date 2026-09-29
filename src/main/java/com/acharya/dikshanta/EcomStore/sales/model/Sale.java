package com.acharya.dikshanta.EcomStore.sales.model;

import com.acharya.dikshanta.EcomStore.common.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
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

    private void calculateTotal() {
        total = subTotal.subtract(discount).add(tax);
    }

}
