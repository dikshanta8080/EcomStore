package com.acharya.dikshanta.EcomStore.sales.listener;

import com.acharya.dikshanta.EcomStore.common.exceptions.BusinessException;
import com.acharya.dikshanta.EcomStore.inventory.dto.request.InventoryMovementRequest;
import com.acharya.dikshanta.EcomStore.inventory.enums.MovementType;
import com.acharya.dikshanta.EcomStore.inventory.service.InventoryMovementService;
import com.acharya.dikshanta.EcomStore.sales.event.SaleCreatedEvent;
import com.acharya.dikshanta.EcomStore.sales.model.Sale;
import com.acharya.dikshanta.EcomStore.sales.model.SaleItem;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Slf4j
@Component
@RequiredArgsConstructor
public class SaleInventoryEventListener {
    private final InventoryMovementService inventoryMovementService;

    @EventListener
    public void handleSaleCreated(SaleCreatedEvent event) {
        Sale sale = event.sale();
        log.info("Handling SaleCreatedEvent for sale id: {}, invoice: {}", sale.getId(), sale.getInvoiceNumber());

        if (sale.getSaleItems() == null || sale.getSaleItems().isEmpty()) {
            return;
        }

        for (SaleItem item : sale.getSaleItems()) {
            if (item.getProduct() == null) {
                continue;
            }

            if (item.getProduct().getBaseUnit() == null) {
                throw new BusinessException("Product '" + item.getProduct().getName() + "' does not have a configured base unit");
            }

            InventoryMovementRequest movementRequest = new InventoryMovementRequest(
                    item.getProduct().getId(),
                    MovementType.OUT,
                    BigDecimal.valueOf(item.getQuantity()),
                    item.getProduct().getBaseUnit().getId(),
                    item.getUnitPrice()
            );

            inventoryMovementService.createInventoryMovement(movementRequest);
        }
    }
}
