package com.acharya.dikshanta.EcomStore.products.repository.projection;

import java.math.BigDecimal;

public interface ProductSummaryProjection {
    Long getTotalProducts();
    BigDecimal getTotalStockUnits();
    Long getHealthyStockCount();
    Long getLowStockCount();
    Long getOutOfStockCount();
}
