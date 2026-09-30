package com.acharya.dikshanta.EcomStore.eventlisteners;

import com.acharya.dikshanta.EcomStore.sales.dto.response.SaleResponse;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class SalesCreatedEventListener {
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onSalesCreatedEvent(SaleResponse saleResponse) {

    }
}
