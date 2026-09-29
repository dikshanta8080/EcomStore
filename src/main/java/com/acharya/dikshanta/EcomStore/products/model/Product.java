package com.acharya.dikshanta.EcomStore.products.model;

import com.acharya.dikshanta.EcomStore.common.model.BaseEntity;
import com.acharya.dikshanta.EcomStore.inventory.model.Inventory;
import com.acharya.dikshanta.EcomStore.units.model.ProductUnitConversion;
import com.acharya.dikshanta.EcomStore.units.model.Unit;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@SuperBuilder
public class Product extends BaseEntity {
    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @Column(name = "sku", nullable = false, unique = true)
    private String sku;

    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "price", nullable = false)
    private BigDecimal price;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "base_unit_id", nullable = false)
    private Unit baseUnit;

    @OneToOne(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private Inventory inventory;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProductUnitConversion> unitConversions = new ArrayList<>();

    public void addUnitConversion(ProductUnitConversion conversion) {
        if (conversion != null) {
            this.unitConversions.add(conversion);
            conversion.setProduct(this);
        }
    }

    public void removeUnitConversion(ProductUnitConversion conversion) {
        if (conversion != null) {
            this.unitConversions.remove(conversion);
            conversion.setProduct(null);
        }
    }
}
