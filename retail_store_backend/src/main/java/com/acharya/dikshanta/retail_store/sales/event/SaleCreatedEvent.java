package com.acharya.dikshanta.retail_store.sales.event;

import com.acharya.dikshanta.retail_store.sales.model.Sale;

public record SaleCreatedEvent(Sale sale) {
}
