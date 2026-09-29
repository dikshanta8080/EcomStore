package com.acharya.dikshanta.EcomStore.inventory.specifications;

import com.acharya.dikshanta.EcomStore.inventory.dto.request.InventoryMovementFilterRequest;
import com.acharya.dikshanta.EcomStore.inventory.enums.MovementType;
import com.acharya.dikshanta.EcomStore.inventory.model.InventoryMovement;
import jakarta.persistence.criteria.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class InventoryMovementSpecificationTest {

    private InventoryMovementSpecification specification;

    @Mock
    private Root<InventoryMovement> root;

    @Mock
    private CriteriaQuery<?> query;

    @Mock
    private CriteriaBuilder cb;

    @Mock
    private Path<Object> path;

    @Mock
    private Predicate predicate;

    @BeforeEach
    void setUp() {
        specification = new InventoryMovementSpecification();
        when(root.get(anyString())).thenReturn((Path) path);
        when(path.get(anyString())).thenReturn((Path) path);
        when(cb.and(any(Predicate[].class))).thenReturn(predicate);
        when(cb.or(any(Predicate[].class))).thenReturn(predicate);
        when(cb.conjunction()).thenReturn(predicate);
    }

    @Test
    void shouldReturnConjunctionWhenFilterRequestIsNull() {
        Specification<InventoryMovement> spec = specification.getSpecification(null);
        Predicate result = spec.toPredicate(root, query, cb);
        assertNotNull(result);
        verify(cb).conjunction();
    }

    @Test
    void shouldBuildPredicatesWithFullFilters() {
        LocalDate today = LocalDate.now();
        InventoryMovementFilterRequest filterRequest = new InventoryMovementFilterRequest(
                "Rice",
                "Rice",
                "RICE-001",
                10L,
                2L,
                MovementType.IN,
                1L,
                new BigDecimal("5.00"),
                new BigDecimal("100.00"),
                new BigDecimal("50.00"),
                new BigDecimal("500.00"),
                today.minusDays(7),
                today,
                null,
                null
        );

        Specification<InventoryMovement> spec = specification.getSpecification(filterRequest);
        Predicate result = spec.toPredicate(root, query, cb);

        assertNotNull(result);
        verify(cb).equal(any(), eq(10L));
        verify(cb).equal(any(), eq(2L));
        verify(cb).equal(any(), eq(MovementType.IN));
        verify(cb).equal(any(), eq(1L));
        verify(cb).greaterThanOrEqualTo(any(), eq(new BigDecimal("5.00")));
        verify(cb).lessThanOrEqualTo(any(), eq(new BigDecimal("100.00")));
        verify(cb).greaterThanOrEqualTo(any(), eq(new BigDecimal("50.00")));
        verify(cb).lessThanOrEqualTo(any(), eq(new BigDecimal("500.00")));
        verify(cb).greaterThanOrEqualTo(any(), eq(today.minusDays(7).atStartOfDay()));
        verify(cb).lessThanOrEqualTo(any(), eq(today.atTime(LocalTime.MAX)));
        verify(cb).and(any(Predicate[].class));
    }
}
