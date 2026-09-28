package com.acharya.dikshanta.EcomStore.products.model;

import com.acharya.dikshanta.EcomStore.common.model.BaseEntity;
import com.acharya.dikshanta.EcomStore.inventory.model.Inventory;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

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

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @OneToOne
    private Inventory inventory;
}
