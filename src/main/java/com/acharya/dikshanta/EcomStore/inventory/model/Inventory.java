package com.acharya.dikshanta.EcomStore.inventory.model;

import com.acharya.dikshanta.EcomStore.common.model.BaseEntity;
import com.acharya.dikshanta.EcomStore.products.model.Product;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

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
    private static final Long ALERT_THRESHOLD = 10L;
    @Column(name = "stock", nullable = false)
    private Long stock;

    @OneToOne
    @JoinColumn(name = "product_id", nullable = false, unique = true)
    private Product product;

    @OneToMany(mappedBy = "inventory", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<InventoryMovement> inventoryMovements = new ArrayList<>();

    public boolean isLowStock() {
        return stock <= ALERT_THRESHOLD;
    }

    public void updateStock(Long quantity) {
        this.stock += quantity;
    }

    public void reduceStock(Long quantity) {
        this.stock -= quantity;
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
