package com.acharya.dikshanta.retail_store.sales.model;

import com.acharya.dikshanta.retail_store.common.model.BaseEntity;
import com.acharya.dikshanta.retail_store.products.model.Product;
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

    @Column(name = "tax", nullable = false)
    private BigDecimal tax;

    @ManyToOne
    @JoinColumn(name = "sale_id")
    private Sale sale;


    public void calculateTotal() {
        total = BigDecimal.valueOf(quantity).multiply(unitPrice);
    }
}
