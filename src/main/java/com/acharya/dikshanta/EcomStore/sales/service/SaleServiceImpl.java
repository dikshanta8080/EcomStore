package com.acharya.dikshanta.EcomStore.sales.service;

import com.acharya.dikshanta.EcomStore.common.dto.request.PaginationRequest;
import com.acharya.dikshanta.EcomStore.common.dto.response.PagedResponse;
import com.acharya.dikshanta.EcomStore.products.model.Product;
import com.acharya.dikshanta.EcomStore.products.repository.ProductRepository;
import com.acharya.dikshanta.EcomStore.sales.dto.request.SaleRequest;
import com.acharya.dikshanta.EcomStore.sales.dto.response.SaleResponse;
import com.acharya.dikshanta.EcomStore.sales.mapper.SalesMapper;
import com.acharya.dikshanta.EcomStore.sales.model.Sale;
import com.acharya.dikshanta.EcomStore.sales.model.SaleItem;
import com.acharya.dikshanta.EcomStore.sales.repository.SalesRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@RequiredArgsConstructor
@Service
public class SaleServiceImpl implements SaleService {
    private final ProductRepository productRepository;
    private final SalesRepository salesRepository;
    private final SalesMapper salesMapper;
    private final ApplicationEventPublisher applicationEventPublisher;


    @Override
    @Transactional
    public SaleResponse createSale(SaleRequest saleRequest) {
        final BigDecimal discount = saleRequest.discountAmount() != null ?
                saleRequest.discountAmount() : BigDecimal.ZERO;
        Sale sale = Sale.builder()
                .discount(discount)
                .build();
        List<SaleItem> saleItemList = saleRequest.saleItems().stream().map(saleItemRequest -> {
            Product product = findProduct(saleItemRequest);
            SaleItem saleItem = buildSaleItem(saleItemRequest, product, sale);
            saleItem.calculateTotal();
            return saleItem;
        }).toList();
        sale.setSaleItems(saleItemList);
        sale.calculateSubTotal();
        sale.calculateTax();
        sale.calculateTotal();
        SaleResponse response = salesMapper.toResponse(salesRepository.save(sale));
        applicationEventPublisher.publishEvent(response);
        return response;

    }

    private Product findProduct(SaleRequest.SaleItemRequest saleItemRequest) {
        return productRepository.findById(saleItemRequest.productId())
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    @Override
    public Sale deleteSale(Long id) {
        return null;
    }

    @Override
    public PagedResponse<Sale> getAllSales(PaginationRequest paginationRequest) {
        return null;
    }

    private SaleItem buildSaleItem(SaleRequest.SaleItemRequest saleItemRequest, Product product, Sale sale) {
        return SaleItem.builder()
                .product(product)
                .quantity(Long.valueOf(saleItemRequest.quantity()))
                .unitPrice(product.getPrice())
                .tax(product.getTaxRate().getRate())
                .sale(sale)
                .build();
    }
}
