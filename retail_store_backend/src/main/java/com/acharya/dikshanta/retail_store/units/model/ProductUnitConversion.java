package com.acharya.dikshanta.retail_store.units.model;

import com.acharya.dikshanta.retail_store.common.model.BaseEntity;
import com.acharya.dikshanta.retail_store.products.model.Product;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Entity
@Table(name = "product_unit_conversions", uniqueConstraints = {
        @UniqueConstraint(name = "uk_product_unit", columnNames = {"product_id", "unit_id"})
})
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@SuperBuilder
public class ProductUnitConversion extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id", nullable = false)
    private Unit unit;

    @Column(name = "conversion_factor", nullable = false, precision = 19, scale = 4)
    private BigDecimal conversionFactor;

    @Column(name = "active", nullable = false)
    @Builder.Default
    private Boolean active = true;
}
