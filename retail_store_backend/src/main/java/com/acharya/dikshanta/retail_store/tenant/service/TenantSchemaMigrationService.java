package com.acharya.dikshanta.retail_store.tenant.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.support.EncodedResource;
import org.springframework.jdbc.datasource.init.ScriptUtils;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.Statement;

@Service
public class TenantSchemaMigrationService {

    private static final Logger log = LoggerFactory.getLogger(TenantSchemaMigrationService.class);
    private final DataSource dataSource;

    public TenantSchemaMigrationService(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void initializeTenantSchema(String schemaName) {
        String cleanSchema = schemaName.replaceAll("[^a-zA-Z0-9_]", "");
        try (Connection connection = dataSource.getConnection()) {
            try (Statement statement = connection.createStatement()) {
                log.info("Creating schema: {}", cleanSchema);
                statement.execute("CREATE SCHEMA IF NOT EXISTS \"" + cleanSchema + "\"");
                statement.execute("SET search_path TO \"" + cleanSchema + "\", public");
            }

            log.info("Executing tenant migrations for schema: {}", cleanSchema);
            ClassPathResource resource = new ClassPathResource("db/tenant/V1__tenant_schema.sql");
            ScriptUtils.executeSqlScript(
                    connection,
                    new EncodedResource(resource, StandardCharsets.UTF_8),
                    false,
                    false,
                    ScriptUtils.DEFAULT_COMMENT_PREFIX,
                    ScriptUtils.DEFAULT_STATEMENT_SEPARATOR,
                    ScriptUtils.DEFAULT_BLOCK_COMMENT_START_DELIMITER,
                    ScriptUtils.DEFAULT_BLOCK_COMMENT_END_DELIMITER
            );
            log.info("Tenant schema initialization completed successfully for: {}", cleanSchema);
        } catch (Exception e) {
            log.error("Failed to initialize schema for tenant: " + schemaName, e);
            throw new RuntimeException("Could not initialize tenant database schema: " + e.getMessage(), e);
        }
    }
}
