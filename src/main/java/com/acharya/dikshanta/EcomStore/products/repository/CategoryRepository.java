package com.acharya.dikshanta.EcomStore.products.repository;

import com.acharya.dikshanta.EcomStore.products.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByName(String name);

    boolean existsByName(String name);
}
