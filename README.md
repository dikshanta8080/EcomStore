# Retail SaaS Cloud - Schema-per-Tenant Multi-Tenant System

Enterprise multi-tenant retail and POS management SaaS platform built with **Spring Boot 4.1.1 (Java 25)** and **React 19 (TypeScript, Vite, TailwindCSS)**.

---

## 🏗️ Architecture Overview

The system uses a **Schema-per-Tenant** multi-tenancy model in PostgreSQL:

1. **Master Schema (`public`)**:
   - `tenants`: Central registry storing client metadata, slug, schema name, status (`ACTIVE`, `SUSPENDED`, `DEACTIVATED`).
   - `users`: Centralized user credentials, password hash, role, and tenant assignment.
2. **Tenant Schemas (`tenant_<slug>`)**:
   - Each client store gets an isolated database schema (`tenant_acme`, `tenant_walmart`, etc.).
   - Contains tenant business tables: `products`, `categories`, `units`, `tax_rates`, `product_unit_conversions`, `inventory`, `inventory_movements`, `sales`, `sale_item`, `payments`, `sub_payments`.
   - Dynamic schema provisioning: Creating a tenant automatically runs `CREATE SCHEMA IF NOT EXISTS "tenant_<slug>"` and executes Flyway/DDL migration scripts with default measurement units and tax rate seeds.
   - Dynamic schema routing via Hibernate: `MultiTenantConnectionProvider` switches connection search paths (`SET search_path TO "tenant_<slug>", public`).

---

## 🛡️ Roles & RBAC (Role-Based Access Control)

| Role | Scope | Capabilities | Restrictions |
|---|---|---|---|
| **`SUPER_ADMIN`** | SaaS Platform Master | Search clients, provision new tenants & schemas, suspend / deactivate / reactivate tenants, inspect store schemas. | Only superadmin can manage tenants. |
| **`TENANT_ADMIN`** | Tenant Store | Manage store team staff, full catalog, inventory, sales, POS, and financial ledgers. | **Cannot** create `SUPER_ADMIN` or `TENANT_ADMIN` users (strictly enforced in backend & UI). |
| **`INVENTORY_MANAGER`** | Tenant Store | Manage product catalog, categories, units, warehouse stock levels, and log inventory movements. | Cannot access store user management or finance. |
| **`ACCOUNTANT`** | Tenant Store | Audit invoices, review sales revenue, tax liabilities, and payment settlement breakdown. | Read-only ledger, cannot modify stock. |
| **`CASHIER`** | Tenant Store | Point-of-Sale checkout terminal, barcode scan, tender cash/card payments, and receipt generation. | Restricted to POS terminal. |

---

## 🔑 Default Credentials

### SaaS Founder / Super Admin
- **Email**: `superadmin@saas.com`
- **Password**: `SuperAdmin@123`
- **Role**: `SUPER_ADMIN`

*(Tenant Admins and team users are provisioned through the Super Admin and Tenant Admin portals).*

---

## 🚀 Running the Application

### 1. Backend (`retail_store_backend`)

```powershell
cd retail_store_backend
.\gradlew bootRun
```
* **Server URL**: `http://localhost:8080/api`
* **Swagger / OpenAPI**: `http://localhost:8080/api/swagger-ui.html`

### 2. Frontend (`retail_store_frontend`)

```powershell
cd retail_store_frontend
npm install
npm run dev
```
* **Client URL**: `http://localhost:5173`

---

## 📡 Key REST Endpoints

### Authentication & Identity
- `POST /api/auth/login`: Authenticate and receive JWT with tenant schema claims
- `GET /api/auth/me`: Get current authenticated user profile and active tenant info

### Super Admin (Founder)
- `POST /api/superadmin/tenants`: Provision new tenant, build PostgreSQL schema, and create initial Tenant Admin
- `GET /api/superadmin/tenants?query=...`: Search and list client tenants
- `GET /api/superadmin/tenants/{id}`: Get tenant details
- `PATCH /api/superadmin/tenants/{id}/status`: Suspend, Deactivate, or Reactivate a tenant
- `GET /api/superadmin/stats`: Total tenants, active schemas, suspended, and user counts

### Tenant User Management
- `GET /api/tenant/users`: List team members in the tenant
- `POST /api/tenant/users`: Create team member (allowed roles: `INVENTORY_MANAGER`, `ACCOUNTANT`, `CASHIER`)
- `PATCH /api/tenant/users/{id}/status`: Toggle user status (`ACTIVE`, `INACTIVE`, `BLOCKED`)

### Store Business Domains (Schema Isolated)
- `/api/products` & `/api/products/summary`: Product catalog & metrics
- `/api/categories` & `/api/units`: Taxonomy & measurement conversions
- `/api/inventory` & `/api/inventory/movements`: Warehouse stock & movements
- `/api/sales` & `/api/payment`: POS orders, split payments, and invoices
