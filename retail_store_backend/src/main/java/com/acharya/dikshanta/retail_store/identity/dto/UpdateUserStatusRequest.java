package com.acharya.dikshanta.retail_store.identity.dto;

import com.acharya.dikshanta.retail_store.identity.enums.UserStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateUserStatusRequest(
        @NotNull(message = "User status cannot be null")
        UserStatus userStatus
) {}
