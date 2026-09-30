package com.acharya.dikshanta.retail_store.inventory.model;

import com.acharya.dikshanta.retail_store.common.model.BaseEntity;
import com.acharya.dikshanta.retail_store.inventory.enums.MovementType;
import com.acharya.dikshanta.retail_store.units.model.Unit;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Entity
@Table(name = "inventory_movements")
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Getter
@Setter
public class InventoryMovement extends BaseEntity {
    @Enumerated(EnumType.STRING)
    @Column(name = "movement_type", nullable = false)
    private MovementType movementType;

    @Column(name = "quantity", nullable = false, precision = 19, scale = 4)
    private BigDecimal quantity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id", nullable = false)
    private Unit unit;

    @Column(name = "base_quantity", nullable = false, precision = 19, scale = 4)
    private BigDecimal baseQuantity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "base_unit_id", nullable = false)
    private Unit baseUnit;

    @Column(name = "conversion_factor", nullable = false, precision = 19, scale = 4)
    private BigDecimal conversionFactor;

    @Column(name = "unit_price", nullable = false, precision = 19, scale = 4)
    private BigDecimal unitPrice;

    @Column(name = "total_amount", nullable = false, precision = 19, scale = 4)
    private BigDecimal totalAmount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inventory_id", nullable = false)
    private Inventory inventory;

    public void calculateValues() {
        if (this.quantity != null && this.conversionFactor != null) {
            this.baseQuantity = this.quantity.multiply(this.conversionFactor);
        }
        if (this.quantity != null && this.unitPrice != null) {
            this.totalAmount = this.quantity.multiply(this.unitPrice);
        }
    }
}
