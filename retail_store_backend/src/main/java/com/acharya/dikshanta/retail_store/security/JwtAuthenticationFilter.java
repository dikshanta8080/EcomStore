package com.acharya.dikshanta.retail_store.security;

import com.acharya.dikshanta.retail_store.multitenancy.TenantContext;
import com.acharya.dikshanta.retail_store.tenant.enums.TenantStatus;
import com.acharya.dikshanta.retail_store.tenant.model.Tenant;
import com.acharya.dikshanta.retail_store.tenant.repository.TenantRepository;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final TenantRepository tenantRepository;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            UserDetailsService userDetailsService,
            TenantRepository tenantRepository
    ) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.tenantRepository = tenantRepository;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);

        try {
            userEmail = jwtService.extractUsername(jwt);

            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

                if (jwtService.isTokenValid(jwt, userDetails)) {
                    Claims claims = jwtService.extractAllClaims(jwt);
                    String role = (String) claims.get("role");
                    Object tenantIdObj = claims.get("tenantId");
                    String schemaName = (String) claims.get("schemaName");

                    // Multi-tenant isolation and tenant status check
                    if (!"SUPER_ADMIN".equalsIgnoreCase(role) && tenantIdObj != null) {
                        Long tenantId = Long.valueOf(tenantIdObj.toString());
                        Optional<Tenant> tenantOpt = tenantRepository.findById(tenantId);

                        if (tenantOpt.isEmpty()) {
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"error\": \"Tenant not found\"}");
                            return;
                        }

                        Tenant tenant = tenantOpt.get();
                        if (tenant.getStatus() == TenantStatus.SUSPENDED) {
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"error\": \"Tenant account is SUSPENDED. Please contact administrator.\"}");
                            return;
                        } else if (tenant.getStatus() == TenantStatus.DEACTIVATED) {
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"error\": \"Tenant account is DEACTIVATED.\"}");
                            return;
                        }

                        TenantContext.setCurrentTenant(tenant.getSchemaName());
                    } else if ("SUPER_ADMIN".equalsIgnoreCase(role)) {
                        // Allow SuperAdmin to inspect specific tenant via header if desired
                        String requestedTenant = request.getHeader("X-Tenant-ID");
                        if (requestedTenant != null && !requestedTenant.isBlank()) {
                            TenantContext.setCurrentTenant(requestedTenant);
                        } else {
                            TenantContext.setCurrentTenant("public");
                        }
                    }

                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }

            filterChain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }
}
