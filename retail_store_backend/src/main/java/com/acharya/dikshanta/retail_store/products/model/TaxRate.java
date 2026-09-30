package com.acharya.dikshanta.retail_store.products.model;

import com.acharya.dikshanta.retail_store.common.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Entity
@Table(name = "tax_rates")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@SuperBuilder
public class TaxRate extends BaseEntity {
    @Column(name = "rate", nullable = false)
    BigDecimal rate;

}
