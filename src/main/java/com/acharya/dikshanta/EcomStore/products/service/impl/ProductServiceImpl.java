package com.acharya.dikshanta.EcomStore.products.service.impl;

import com.acharya.dikshanta.EcomStore.common.dto.response.PagedResponse;
import com.acharya.dikshanta.EcomStore.common.exceptions.DuplicateResourceException;
import com.acharya.dikshanta.EcomStore.common.exceptions.ResourceNotFoundException;
import com.acharya.dikshanta.EcomStore.inventory.model.Inventory;
import com.acharya.dikshanta.EcomStore.inventory.service.InventoryService;
import com.acharya.dikshanta.EcomStore.products.dto.request.ProductCreateRequest;
import com.acharya.dikshanta.EcomStore.products.dto.request.ProductFilterRequest;
import com.acharya.dikshanta.EcomStore.products.dto.request.ProductUpdateRequest;
import com.acharya.dikshanta.EcomStore.products.dto.response.ProductResponse;
import com.acharya.dikshanta.EcomStore.products.dto.response.ProductSummaryResponse;
import com.acharya.dikshanta.EcomStore.products.mapper.ProductMapper;
import com.acharya.dikshanta.EcomStore.products.model.Category;
import com.acharya.dikshanta.EcomStore.products.model.Product;
import com.acharya.dikshanta.EcomStore.products.model.TaxRate;
import com.acharya.dikshanta.EcomStore.products.repository.CategoryRepository;
import com.acharya.dikshanta.EcomStore.products.repository.ProductRepository;
import com.acharya.dikshanta.EcomStore.products.repository.TaxRateRepository;
import com.acharya.dikshanta.EcomStore.products.service.ProductService;
import com.acharya.dikshanta.EcomStore.products.specifications.ProductSpecification;
import com.acharya.dikshanta.EcomStore.units.model.ProductUnitConversion;
import com.acharya.dikshanta.EcomStore.units.model.Unit;
import com.acharya.dikshanta.EcomStore.units.repository.UnitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final CategoryRepository categoryRepository;
    private final UnitRepository unitRepository;
    private final TaxRateRepository taxRateRepository;
    private final InventoryService inventoryService;
    private final ProductSpecification productSpecification;
    private final com.acharya.dikshanta.EcomStore.units.config.DataInitializer dataInitializer;

    @Transactional
    @Override
    public ProductResponse createProduct(ProductCreateRequest productCreateRequest) {
        checkIfProductExistsByNameAndSku(productCreateRequest.name(), productCreateRequest.sku());
        Category category = findCategoryById(productCreateRequest.categoryId());
        Unit baseUnit = findUnitById(productCreateRequest.baseUnitId());

        Product product = productMapper.toProduct(productCreateRequest);
        product.setCategory(category);
        product.setBaseUnit(baseUnit);
        if (productCreateRequest.taxRateId() != null) {
            TaxRate taxRate = findTaxRateById(productCreateRequest.taxRateId());
            product.setTaxRate(taxRate);
        }


        ProductUnitConversion baseUnitConversion = ProductUnitConversion.builder()
                .product(product)
                .unit(baseUnit)
                .conversionFactor(BigDecimal.ONE)
                .active(true)
                .build();
        product.addUnitConversion(baseUnitConversion);

        productRepository.save(product);
        Inventory inventory = inventoryService.createInventory(product);
        product.setInventory(inventory);
        return productMapper.toProductResponse(product);
    }

    @Transactional
    @Override
    public ProductResponse updateProduct(Long id, ProductUpdateRequest productUpdateRequest) {
        Product product = findProductById(id);
        updateProductFields(productUpdateRequest, product);

        return productMapper.toProductResponse(product);
    }

    @Override
    @Transactional
    public ProductResponse deleteProduct(Long id) {
        Product product = findProductById(id);
        product.setActive(false);
        Product saved = productRepository.save(product);
        return productMapper.toProductResponse(saved);
    }

    @Override
    @Transactional
    public ProductResponse restoreProduct(Long id) {
        Product product = findProductById(id);
        product.setActive(true);
        Product saved = productRepository.save(product);
        return productMapper.toProductResponse(saved);
    }

    @Transactional(readOnly = true)
    @Override
    public ProductResponse getProductById(Long id) {
        Product product = findProductById(id);
        return productMapper.toProductResponse(product);
    }

    @Transactional(readOnly = true)
    @Override
    public PagedResponse<ProductResponse> getAllProducts(Pageable pageable, ProductFilterRequest filterRequest) {
        Specification<Product> specification = productSpecification.getSpecification(filterRequest);
        Page<Product> products = productRepository.findAll(specification, pageable);

        Page<ProductResponse> responsePage = products.map(productMapper::toProductResponse);
        return PagedResponse.from(responsePage);
    }

    @Transactional(readOnly = true)
    @Override
    public ProductSummaryResponse getProductSummary() {
        var projection = productRepository.getProductSummary();
        if (projection == null) {
            return new ProductSummaryResponse(0L, BigDecimal.ZERO, 0L, 0L, 0L);
        }
        return new ProductSummaryResponse(
                projection.getTotalProducts() != null ? projection.getTotalProducts() : 0L,
                projection.getTotalStockUnits() != null ? projection.getTotalStockUnits() : BigDecimal.ZERO,
                projection.getHealthyStockCount() != null ? projection.getHealthyStockCount() : 0L,
                projection.getLowStockCount() != null ? projection.getLowStockCount() : 0L,
                projection.getOutOfStockCount() != null ? projection.getOutOfStockCount() : 0L
        );
    }

    @Override
    @Transactional
    public void seedSampleData() {
        dataInitializer.seedAllData();
    }

    private Product findProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    private Unit findUnitById(Long id) {
        return unitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Base unit not found with id: " + id));
    }

    private void checkIfProductExistsByNameAndSku(String name, String sku) {
        if (productRepository.existsByNameOrSku(name, sku)) {
            throw new DuplicateResourceException("Product with name '" + name + "' or SKU '" + sku + "' already exists");
        }
    }

    private Category findCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    }

    private void updateProductFields(ProductUpdateRequest productUpdateRequest, Product product) {
        if (productUpdateRequest.name() != null) {
            product.setName(productUpdateRequest.name());
        }
        if (productUpdateRequest.description() != null) {
            product.setDescription(productUpdateRequest.description());
        }
        if (productUpdateRequest.price() != null) {
            product.setPrice(productUpdateRequest.price());
        }
        if (productUpdateRequest.categoryId() != null) {
            Category newCategory = findCategoryById(productUpdateRequest.categoryId());
            product.setCategory(newCategory);
            newCategory.addProduct(product);
        }
        if (productUpdateRequest.baseUnitId() != null) {
            Unit newBaseUnit = findUnitById(productUpdateRequest.baseUnitId());
            product.setBaseUnit(newBaseUnit);
        }
        if (productUpdateRequest.taxRateId() != null) {
            if (productUpdateRequest.taxRateId() <= 0) {
                product.setTaxRate(null);
            } else {
                TaxRate newTaxRate = findTaxRateById(productUpdateRequest.taxRateId());
                product.setTaxRate(newTaxRate);
            }
        }
    }

    private TaxRate findTaxRateById(Long id) {
        return taxRateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tax rate not found with id: " + id));
    }
}
