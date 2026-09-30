package com.acharya.dikshanta.retail_store.sales.repository;

import com.acharya.dikshanta.retail_store.sales.model.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface SalesRepository extends JpaRepository<Sale, Long>, JpaSpecificationExecutor<Sale> {
}
