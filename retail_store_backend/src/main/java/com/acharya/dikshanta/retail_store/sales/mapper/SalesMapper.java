package com.acharya.dikshanta.retail_store.sales.mapper;

import com.acharya.dikshanta.retail_store.sales.dto.response.SaleResponse;
import com.acharya.dikshanta.retail_store.sales.model.Sale;
import com.acharya.dikshanta.retail_store.sales.model.SaleItem;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SalesMapper {

    public SaleResponse toResponse(Sale sale) {
        if (sale == null) {
            return null;
        }

        return SaleResponse.builder()
                .id(sale.getId())
                .invoiceNumber(sale.getInvoiceNumber())
                .status(sale.getStatus())
                .subTotal(sale.getSubTotal())
                .discount(sale.getDiscount())
                .tax(sale.getTax())
                .total(sale.getTotal())
                .createdAt(sale.getCreatedAt())
                .saleItems(getSaleItemResponse(sale.getSaleItems()))
                .build();
    }

    private List<SaleResponse.SaleItemResponse> getSaleItemResponse(List<SaleItem> saleItems) {
        if (saleItems == null) {
            return List.of();
        }

        return saleItems.stream()
                .map(saleItem -> SaleResponse.SaleItemResponse.builder()
                        .id(saleItem.getId())
                        .productName(saleItem.getProduct() != null ? saleItem.getProduct().getName() : null)
                        .productId(saleItem.getProduct() != null ? saleItem.getProduct().getId() : null)
                        .unitPrice(saleItem.getUnitPrice())
                        .quantity(saleItem.getQuantity())
                        .total(saleItem.getTotal())
                        .itemTax(saleItem.getTax())
                        .build())
                .toList();
    }
}