package com.acharya.dikshanta.EcomStore.sales.model;

import com.acharya.dikshanta.EcomStore.common.model.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
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
    private Long productId;
    private Long quantity;
    private BigDecimal price;
}
