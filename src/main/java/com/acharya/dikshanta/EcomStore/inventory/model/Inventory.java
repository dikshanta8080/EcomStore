package com.acharya.dikshanta.EcomStore.inventory.model;

import com.acharya.dikshanta.EcomStore.common.model.BaseEntity;
import com.acharya.dikshanta.EcomStore.products.model.Product;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "inventory")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@SuperBuilder
public class Inventory extends BaseEntity {
    private static final BigDecimal ALERT_THRESHOLD = new BigDecimal("10.0000");

    @Column(name = "stock", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal stock = BigDecimal.ZERO;

    @OneToOne
    @JoinColumn(name = "product_id", nullable = false, unique = true)
    private Product product;

    @OneToMany(mappedBy = "inventory", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<InventoryMovement> inventoryMovements = new ArrayList<>();

    public boolean isLowStock() {
        return stock != null && stock.compareTo(ALERT_THRESHOLD) <= 0;
    }

    public void updateStock(BigDecimal quantity) {
        if (this.stock == null) {
            this.stock = BigDecimal.ZERO;
        }
        this.stock = this.stock.add(quantity);
    }

    public void reduceStock(BigDecimal quantity) {
        if (this.stock == null) {
            this.stock = BigDecimal.ZERO;
        }
        this.stock = this.stock.subtract(quantity);
    }

    public void addInventoryMovement(InventoryMovement inventoryMovement) {
        if (inventoryMovement != null) {
            this.inventoryMovements.add(inventoryMovement);
            inventoryMovement.setInventory(this);
        }
    }

    public void removeInventoryMovement(InventoryMovement inventoryMovement) {
        if (inventoryMovement != null) {
            this.inventoryMovements.remove(inventoryMovement);
            inventoryMovement.setInventory(null);
        }
    }
}
