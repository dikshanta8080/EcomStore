package com.acharya.dikshanta.EcomStore.sales.model;

import com.acharya.dikshanta.EcomStore.common.model.BaseEntity;
import com.acharya.dikshanta.EcomStore.products.model.Product;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Entity
@Table(name = "sale_item")
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Getter
@Setter
public class SaleItem extends BaseEntity {
    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(name = "quantity", nullable = false)
    private Long quantity;

    @Column(name = "price", nullable = false)
    private BigDecimal unitPrice;

    @Column(name = "total", nullable = false)
    private BigDecimal total;

    @ManyToOne
    @JoinColumn(name = "sale_id")
    private Sale sale;

    public void calculateTotal() {
        total = BigDecimal.valueOf(quantity).multiply(unitPrice);
    }
}
