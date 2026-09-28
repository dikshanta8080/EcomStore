package com.acharya.dikshanta.EcomStore.products.service.impl;

import com.acharya.dikshanta.EcomStore.common.dto.response.PagedResponse;
import com.acharya.dikshanta.EcomStore.common.exceptions.ResourceNotFoundException;
import com.acharya.dikshanta.EcomStore.inventory.model.Inventory;
import com.acharya.dikshanta.EcomStore.inventory.service.InventoryService;
import com.acharya.dikshanta.EcomStore.products.dto.request.ProductCreateRequest;
import com.acharya.dikshanta.EcomStore.products.dto.request.ProductUpdateRequest;
import com.acharya.dikshanta.EcomStore.products.dto.response.ProductResponse;
import com.acharya.dikshanta.EcomStore.products.mapper.ProductMapper;
import com.acharya.dikshanta.EcomStore.products.model.Category;
import com.acharya.dikshanta.EcomStore.products.model.Product;
import com.acharya.dikshanta.EcomStore.products.repository.CategoryRepository;
import com.acharya.dikshanta.EcomStore.products.repository.ProductRepository;
import com.acharya.dikshanta.EcomStore.products.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final CategoryRepository categoryRepository;
    private final InventoryService inventoryService;

    @Transactional
    @Override
    public ProductResponse createProduct(ProductCreateRequest productCreateRequest) {
        checkIfProductExistsByNameAndSku(productCreateRequest.name(), productCreateRequest.sku());
        Category category = findCategoryById(productCreateRequest.categoryId());
        Product product = productMapper.toProduct(productCreateRequest);
        product.setCategory(category);
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
        productRepository.delete(product);
        return productMapper.toProductResponse(product);
    }

    @Transactional(readOnly = true)
    @Override
    public ProductResponse getProductById(Long id) {
        Product product = findProductById(id);
        return productMapper.toProductResponse(product);
    }

    @Transactional(readOnly = true)
    @Override
    public PagedResponse<ProductResponse> getAllProducts(Pageable pageable) {
        Page<Product> products = productRepository.findAll(pageable);
        Page<ProductResponse> responsePage = products.map(productMapper::toProductResponse);
        return PagedResponse.from(responsePage);
    }

    private Product findProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    }

    private void checkIfProductExistsByNameAndSku(String name, String sku) {
        if (productRepository.existsByNameOrSku(name, sku)) {
            throw new ResourceNotFoundException("Product already found");
        }
    }

    private Category findCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
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
    }
}
