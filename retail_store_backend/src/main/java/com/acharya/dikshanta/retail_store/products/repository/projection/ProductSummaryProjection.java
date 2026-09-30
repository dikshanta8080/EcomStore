package com.acharya.dikshanta.retail_store.products.repository.projection;

import java.math.BigDecimal;

public interface ProductSummaryProjection {
    Long getTotalProducts();
    BigDecimal getTotalStockUnits();
    Long getHealthyStockCount();
    Long getLowStockCount();
    Long getOutOfStockCount();
}
