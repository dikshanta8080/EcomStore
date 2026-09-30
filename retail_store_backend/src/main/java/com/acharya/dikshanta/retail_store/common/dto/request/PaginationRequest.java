package com.acharya.dikshanta.retail_store.common.dto.request;

import lombok.Builder;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

@Builder
public record PaginationRequest(
        Integer page,
        Integer size,
        String sort,
        String direction

) {
    public Pageable toPageable() {
        int pageNo = page == null ? 0 : page;
        int pageSize = size == null ? 10 : size;
        String sortBy = sort == null ? "id" : sort;
        Sort.Direction sortDirection =
                "desc".equalsIgnoreCase(direction)
                        ? Sort.Direction.DESC
                        : Sort.Direction.ASC;
        return PageRequest.of(pageNo, pageSize, Sort.by(sortDirection, sortBy));

    }
}
