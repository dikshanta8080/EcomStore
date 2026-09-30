package com.acharya.dikshanta.EcomStore.sales.service;

import com.acharya.dikshanta.EcomStore.common.dto.request.PaginationRequest;
import com.acharya.dikshanta.EcomStore.common.dto.response.PagedResponse;
import com.acharya.dikshanta.EcomStore.common.exceptions.BusinessException;
import com.acharya.dikshanta.EcomStore.common.exceptions.ResourceNotFoundException;
import com.acharya.dikshanta.EcomStore.products.model.Product;
import com.acharya.dikshanta.EcomStore.products.repository.ProductRepository;
import com.acharya.dikshanta.EcomStore.sales.dto.request.SaleRequest;
import com.acharya.dikshanta.EcomStore.sales.dto.response.SaleResponse;
import com.acharya.dikshanta.EcomStore.sales.enums.SaleStatus;
import com.acharya.dikshanta.EcomStore.sales.event.SaleCreatedEvent;
import com.acharya.dikshanta.EcomStore.sales.mapper.SalesMapper;
import com.acharya.dikshanta.EcomStore.sales.model.Sale;
import com.acharya.dikshanta.EcomStore.sales.model.SaleItem;
import com.acharya.dikshanta.EcomStore.sales.repository.SalesRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import com.acharya.dikshanta.EcomStore.sales.dto.request.SaleFilterRequest;
import com.acharya.dikshanta.EcomStore.sales.specifications.SaleSpecification;
import org.springframework.data.jpa.domain.Specification;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
@Service
public class SaleServiceImpl implements SaleService {
    private final ProductRepository productRepository;
    private final SalesRepository salesRepository;
    private final SalesMapper salesMapper;
    private final ApplicationEventPublisher applicationEventPublisher;
    private final SaleSpecification saleSpecification;

    @Override
    @Transactional
    public SaleResponse createSale(SaleRequest saleRequest) {
        if (saleRequest.saleItems() == null || saleRequest.saleItems().isEmpty()) {
            throw new BusinessException("Sale must contain at least one item");
        }

        final BigDecimal discount = saleRequest.discountAmount() != null && saleRequest.discountAmount().compareTo(BigDecimal.ZERO) >= 0
                ? saleRequest.discountAmount()
                : BigDecimal.ZERO;

        Sale sale = Sale.builder()
                .status(SaleStatus.PENDING)
                .discount(discount)
                .saleItems(new ArrayList<>())
                .build();

        List<SaleItem> saleItemList = new ArrayList<>();
        for (SaleRequest.SaleItemRequest itemReq : saleRequest.saleItems()) {
            if (itemReq.quantity() == null || itemReq.quantity() <= 0) {
                throw new BusinessException("Item quantity must be greater than 0");
            }
            Product product = findProduct(itemReq);
            SaleItem saleItem = buildSaleItem(itemReq, product, sale);
            saleItem.calculateTotal();
            saleItemList.add(saleItem);
        }

        sale.setSaleItems(saleItemList);
        sale.calculateSubTotal();
        sale.calculateTax();
        sale.calculateTotal();

        Sale savedSale = salesRepository.save(sale);

        // Publish event to reduce stock via inventory movement
        applicationEventPublisher.publishEvent(new SaleCreatedEvent(savedSale));

        return salesMapper.toResponse(savedSale);
    }

    @Override
    @Transactional(readOnly = true)
    public SaleResponse getSaleById(Long id) {
        Sale sale = salesRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found with id: " + id));
        return salesMapper.toResponse(sale);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<SaleResponse> getAllSales(PaginationRequest paginationRequest, SaleFilterRequest filterRequest) {
        Pageable pageable = (paginationRequest != null)
                ? paginationRequest.toPageable()
                : PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"));
        Specification<Sale> spec = saleSpecification.getSpecification(filterRequest);
        Page<Sale> salesPage = salesRepository.findAll(spec, pageable);
        return PagedResponse.from(salesPage.map(salesMapper::toResponse));
    }

    @Override
    @Transactional
    public SaleResponse cancelSale(Long id) {
        Sale sale = salesRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found with id: " + id));

        if (sale.getStatus() == SaleStatus.COMPLETED) {
            throw new BusinessException("Cannot cancel an already completed sale");
        }

        sale.setStatus(SaleStatus.CANCELLED);
        Sale updated = salesRepository.save(sale);
        return salesMapper.toResponse(updated);
    }

    private Product findProduct(SaleRequest.SaleItemRequest saleItemRequest) {
        return productRepository.findById(saleItemRequest.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + saleItemRequest.productId()));
    }

    private SaleItem buildSaleItem(SaleRequest.SaleItemRequest saleItemRequest, Product product, Sale sale) {
        BigDecimal taxRate = (product.getTaxRate() != null && product.getTaxRate().getRate() != null)
                ? product.getTaxRate().getRate()
                : BigDecimal.ZERO;

        BigDecimal unitPrice = product.getPrice() != null ? product.getPrice() : BigDecimal.ZERO;
        BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(saleItemRequest.quantity()));
        BigDecimal itemTax = lineTotal.multiply(taxRate).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        return SaleItem.builder()
                .product(product)
                .quantity(Long.valueOf(saleItemRequest.quantity()))
                .unitPrice(unitPrice)
                .tax(itemTax)
                .sale(sale)
                .build();
    }
}
