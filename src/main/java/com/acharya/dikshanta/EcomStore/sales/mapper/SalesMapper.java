package com.acharya.dikshanta.EcomStore.sales.mapper;

import com.acharya.dikshanta.EcomStore.sales.dto.response.SaleResponse;
import com.acharya.dikshanta.EcomStore.sales.model.Sale;
import com.acharya.dikshanta.EcomStore.sales.model.SaleItem;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SalesMapper {

    public SaleResponse toResponse(Sale sale) {
        return SaleResponse.builder()
                .invoiceNumber(sale.getInvoiceNumber())
                .subTotal(sale.getSubTotal())
                .discount(sale.getDiscount())
                .tax(sale.getTax())
                .total(sale.getTotal())
                .saleItems(getSaleItemResponse(sale.getSaleItems()))
                .build();
    }

    private List<SaleResponse.SaleItemResponse> getSaleItemResponse(List<SaleItem> saleItems) {
        return saleItems.stream()
                .map(saleItem -> SaleResponse.SaleItemResponse.builder()
                        .productName(saleItem.getProduct().getName())
                        .unitPrice(saleItem.getUnitPrice())
                        .quantity(saleItem.getQuantity())
                        .total(saleItem.getTotal())
                        .itemTax(saleItem.getTax())
                        .build())
                .toList();
    }
}