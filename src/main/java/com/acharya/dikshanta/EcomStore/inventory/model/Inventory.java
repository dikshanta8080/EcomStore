package com.acharya.dikshanta.EcomStore.inventory.model;

import com.acharya.dikshanta.EcomStore.common.model.BaseEntity;
import com.acharya.dikshanta.EcomStore.products.model.Product;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "inventory")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@SuperBuilder
public class Inventory extends BaseEntity {
    private static final Long ALERT_THRESHOLD = 10L;
    @Column(name = "stock", nullable = false)
    private Long stock;

    @OneToOne
    @JoinColumn(name = "product_id", nullable = false, unique = true)
    private Product product;

    public boolean isLowStock() {
        return stock <= ALERT_THRESHOLD;
    }

    public void updateStock(Long quantity) {
        this.stock += quantity;
    }

    public void reduceStock(Long quantity) {
        this.stock -= quantity;
    }


}
