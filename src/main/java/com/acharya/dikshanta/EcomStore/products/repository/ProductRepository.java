package com.acharya.dikshanta.EcomStore.products.repository;

import com.acharya.dikshanta.EcomStore.products.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    boolean existsByNameOrSku(String name, String sku);


}
