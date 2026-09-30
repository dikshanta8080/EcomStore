package com.acharya.dikshanta.retail_store.units.model;

import com.acharya.dikshanta.retail_store.common.model.BaseEntity;
import com.acharya.dikshanta.retail_store.units.enums.UnitType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "units")
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Getter
@Setter
public class Unit extends BaseEntity {
    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @Column(name = "symbol", nullable = false, unique = true)
    private String symbol;

    @Column(name = "unit_type", nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private UnitType unitType = UnitType.COUNT;

}
