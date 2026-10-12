import { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/layout/Layout';
import type { NavTab } from './components/layout/Sidebar';
import { ToastContainer, type ToastMessage } from './components/common/Toast';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { ProductsPage } from './pages/Products/ProductsPage';
import { CategoriesPage } from './pages/Categories/CategoriesPage';
import { UnitsPage } from './pages/Units/UnitsPage';
import { TaxRatesPage } from './pages/TaxRates/TaxRatesPage';
import { InventoryPage } from './pages/Inventory/InventoryPage';
import { MovementsPage } from './pages/InventoryMovements/MovementsPage';
import { ProductFormModal } from './pages/Products/ProductFormModal';
import { CategoryFormModal } from './pages/Categories/CategoryFormModal';
import { TaxRateFormModal } from './pages/TaxRates/TaxRateFormModal';
import { CreateMovementModal } from './pages/InventoryMovements/CreateMovementModal';
import { PosPage } from './pages/POS/PosPage';

// Multi-Tenant Role Dashboards & Authentication
import { SuperAdminDashboard } from './pages/SuperAdmin/SuperAdminDashboard';
import { TenantAdminDashboard } from './pages/TenantAdmin/TenantAdminDashboard';
import { InventoryManagerDashboard } from './pages/Inventory/InventoryManagerDashboard';
import { AccountantDashboard } from './pages/Accounting/AccountantDashboard';
import { CashierDashboard } from './pages/POS/CashierDashboard';
import { LoginPage } from './pages/Auth/LoginPage';
import { AuthProvider, useAuth } from './context/AuthContext';

import { productService } from './api/productService';
import { categoryService } from './api/categoryService';
import { unitService } from './api/unitService';
import { taxRateService } from './api/taxRateService';
import { inventoryService } from './api/inventoryService';
import { getErrorMessage } from './api/client';

import type { Product, ProductCreateRequest, ProductUpdateRequest, ProductQueryParams, ProductSummary } from './types/product';
import type { Category, CategoryRequest } from './types/category';
import type { Unit, UnitRequest } from './types/unit';
import type { TaxRate, TaxRateRequest } from './types/taxRate';
import type { InventoryMovement, InventoryMovementRequest, InventoryMovementFilterParams } from './types/inventory';
import type { PagedResponse } from './types/api';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { user, isAuthenticated, isLoading: isAuthLoading, setActiveTenantSlug } = useAuth();

  const getDefaultTabForRole = useCallback((): NavTab => {
    switch (user?.role) {
      case 'SUPER_ADMIN':
        return 'superadmin-tenants';
      case 'TENANT_ADMIN':
        return 'tenant-admin';
      case 'INVENTORY_MANAGER':
        return 'inventory-manager';
      case 'ACCOUNTANT':
        return 'accountant-dashboard';
      case 'CASHIER':
        return 'cashier-dashboard';
      default:
        return 'dashboard';
    }
  }, [user?.role]);

  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Set default tab on user login
  useEffect(() => {
    if (user) {
      setCurrentTab(getDefaultTabForRole());
    }
  }, [user, getDefaultTabForRole]);

  // Data states
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [pagedProducts, setPagedProducts] = useState<PagedResponse<Product> | null>(null);
  const [pagedMovements, setPagedMovements] = useState<PagedResponse<InventoryMovement> | null>(null);

  // Pagination & Filter query states
  const [productQueryParams, setProductQueryParams] = useState<ProductQueryParams>({
    page: 0,
    size: 10,
    sort: 'id',
    direction: 'asc',
  });

  const [productSummary, setProductSummary] = useState<ProductSummary | null>(null);

  const [movementFilterParams, setMovementFilterParams] = useState<InventoryMovementFilterParams>({
    page: 0,
    size: 10,
    sort: 'id',
    direction: 'desc',
  });

  // Loading states
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [isMovementsLoading, setIsMovementsLoading] = useState(false);

  // Global shortcut modals
  const [isQuickProductModalOpen, setIsQuickProductModalOpen] = useState(false);
  const [isQuickCategoryModalOpen, setIsQuickCategoryModalOpen] = useState(false);
  const [isQuickTaxRateModalOpen, setIsQuickTaxRateModalOpen] = useState(false);
  const [isQuickMovementModalOpen, setIsQuickMovementModalOpen] = useState(false);
  const [targetProductForMovement, setTargetProductForMovement] = useState<Product | null>(null);

  // Toast dispatchers
  const addToast = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch all categories
  const fetchCategories = useCallback(async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch {
      // Ignored
    }
  }, []);

  // Fetch all units
  const fetchUnits = useCallback(async () => {
    try {
      const data = await unitService.getAllUnits();
      setUnits(data);
    } catch {
      // Ignored
    }
  }, []);

  // Fetch all tax rates
  const fetchTaxRates = useCallback(async () => {
    try {
      const data = await taxRateService.getAllTaxRates();
      setTaxRates(data);
    } catch {
      // Ignored
    }
  }, []);

  // Fetch all products
  const fetchAllProducts = useCallback(async () => {
    try {
      const data = await productService.getAllProducts({ size: 1000 });
      setAllProducts(data.content || []);
    } catch {
      // Ignored
    }
  }, []);

  // Fetch paged products
  const fetchPagedProducts = useCallback(
    async (params?: ProductQueryParams) => {
      setIsProductsLoading(true);
      try {
        const query = params || productQueryParams;
        const data = await productService.getAllProducts(query);
        setPagedProducts(data);
      } catch (err) {
        addToast('error', getErrorMessage(err));
      } finally {
        setIsProductsLoading(false);
      }
    },
    [productQueryParams, addToast]
  );

  // Fetch product summary
  const fetchProductSummary = useCallback(async () => {
    try {
      const summary = await productService.getProductSummary();
      setProductSummary(summary);
    } catch {
      // Ignored
    }
  }, []);

  // Fetch paged movements
  const fetchPagedMovements = useCallback(
    async (params?: InventoryMovementFilterParams) => {
      setIsMovementsLoading(true);
      try {
        const query = params || movementFilterParams;
        const data = await inventoryService.getAllMovements(query);
        setPagedMovements(data);
      } catch (err) {
        addToast('error', getErrorMessage(err));
      } finally {
        setIsMovementsLoading(false);
      }
    },
    [movementFilterParams, addToast]
  );

  // Initial load
  useEffect(() => {
    if (isAuthenticated && user?.role !== 'SUPER_ADMIN') {
      const initLoad = async () => {
        setIsInitialLoading(true);
        await Promise.allSettled([
          fetchCategories(),
          fetchUnits(),
          fetchTaxRates(),
          fetchAllProducts(),
          fetchPagedProducts(productQueryParams),
          fetchProductSummary(),
          fetchPagedMovements(movementFilterParams),
        ]);
        setIsInitialLoading(false);
      };
      initLoad();
    }
  }, [
    isAuthenticated,
    user?.role,
    fetchCategories,
    fetchUnits,
    fetchTaxRates,
    fetchAllProducts,
    fetchPagedProducts,
    fetchProductSummary,
    fetchPagedMovements,
  ]);

  // Global manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (user?.role !== 'SUPER_ADMIN') {
      await Promise.allSettled([
        fetchCategories(),
        fetchUnits(),
        fetchTaxRates(),
        fetchAllProducts(),
        fetchPagedProducts(productQueryParams),
        fetchProductSummary(),
        fetchPagedMovements(movementFilterParams),
      ]);
    }
    setIsRefreshing(false);
    addToast('info', 'Data refreshed from server');
  };

  // Product Actions
  const handleCreateProduct = async (data: ProductCreateRequest) => {
    try {
      const created = await productService.createProduct(data);
      addToast('success', `Product "${created.name}" created successfully.`);
      await Promise.all([
        fetchAllProducts(),
        fetchPagedProducts(productQueryParams),
        fetchProductSummary(),
      ]);
    } catch (err) {
      const msg = getErrorMessage(err);
      addToast('error', msg);
      throw err;
    }
  };

  const handleUpdateProduct = async (id: number, data: ProductUpdateRequest) => {
    try {
      const updated = await productService.updateProduct(id, data);
      addToast('success', `Product "${updated.name}" updated successfully.`);
      await Promise.all([
        fetchAllProducts(),
        fetchPagedProducts(productQueryParams),
        fetchProductSummary(),
      ]);
    } catch (err) {
      const msg = getErrorMessage(err);
      addToast('error', msg);
      throw err;
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      const deleted = await productService.deleteProduct(id);
      addToast('success', `Product "${deleted.name}" soft deleted.`);
      await Promise.all([
        fetchAllProducts(),
        fetchPagedProducts(productQueryParams),
        fetchProductSummary(),
      ]);
    } catch (err) {
      const msg = getErrorMessage(err);
      addToast('error', msg);
      throw err;
    }
  };

  const handleRestoreProduct = async (id: number) => {
    try {
      const restored = await productService.restoreProduct(id);
      addToast('success', `Product "${restored.name}" restored successfully.`);
      await Promise.all([
        fetchAllProducts(),
        fetchPagedProducts(productQueryParams),
        fetchProductSummary(),
      ]);
    } catch (err) {
      const msg = getErrorMessage(err);
      addToast('error', msg);
      throw err;
    }
  };

  const handleSeedData = async () => {
    try {
      const msg = await productService.seedSampleData();
      addToast('success', msg);
      await Promise.all([
        fetchCategories(),
        fetchUnits(),
        fetchTaxRates(),
        fetchAllProducts(),
        fetchPagedProducts(productQueryParams),
        fetchProductSummary(),
        fetchPagedMovements(movementFilterParams),
      ]);
    } catch (err) {
      const msg = getErrorMessage(err);
      addToast('error', msg);
      throw err;
    }
  };

  // Category Actions
  const handleCreateCategory = async (data: CategoryRequest) => {
    try {
      const created = await categoryService.createCategory(data);
      addToast('success', `Category "${created.name}" created successfully.`);
      await fetchCategories();
    } catch (err) {
      const msg = getErrorMessage(err);
      addToast('error', msg);
      throw err;
    }
  };

  const handleUpdateCategory = async (id: number, data: CategoryRequest) => {
    try {
      const updated = await categoryService.updateCategory(id, data);
      addToast('success', `Category "${updated.name}" updated successfully.`);
      await fetchCategories();
    } catch (err) {
      const msg = getErrorMessage(err);
      addToast('error', msg);
      throw err;
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      const msg = await categoryService.deleteCategory(id);
      addToast('success', msg);
      await fetchCategories();
    } catch (err) {
      const msg = getErrorMessage(err);
      addToast('error', msg);
      throw err;
    }
  };

  // Unit Actions
  const handleCreateUnit = async (data: UnitRequest) => {
    try {
      const created = await unitService.createUnit(data);
      addToast('success', `Unit "${created.name} (${created.symbol})" created.`);
      await fetchUnits();
    } catch (err) {
      const msg = getErrorMessage(err);
      addToast('error', msg);
      throw err;
    }
  };

  const handleUpdateUnit = async (id: number, data: UnitRequest) => {
    try {
      const updated = await unitService.updateUnit(id, data);
      addToast('success', `Unit "${updated.name}" updated successfully.`);
      await fetchUnits();
    } catch (err) {
      const msg = getErrorMessage(err);
      addToast('error', msg);
      throw err;
    }
  };

  const handleDeleteUnit = async (id: number) => {
    try {
      const msg = await unitService.deleteUnit(id);
      addToast('success', msg);
      await fetchUnits();
    } catch (err) {
      const msg = getErrorMessage(err);
      addToast('error', msg);
      throw err;
    }
  };

  // Tax Rate Actions
  const handleCreateTaxRate = async (data: TaxRateRequest) => {
    try {
      const created = await taxRateService.createTaxRate(data);
      addToast('success', `Tax rate ${created.rate}% created successfully.`);
      await fetchTaxRates();
    } catch (err) {
      const msg = getErrorMessage(err);
      addToast('error', msg);
      throw err;
    }
  };

  const handleUpdateTaxRate = async (id: number, data: TaxRateRequest) => {
    try {
      const updated = await taxRateService.updateTaxRate(id, data);
      addToast('success', `Tax rate #${id} updated to ${updated.rate}%.`);
      await fetchTaxRates();
    } catch (err) {
      const msg = getErrorMessage(err);
      addToast('error', msg);
      throw err;
    }
  };

  const handleDeleteTaxRate = async (id: number) => {
    try {
      const msg = await taxRateService.deleteTaxRate(id);
      addToast('success', msg);
      await fetchTaxRates();
    } catch (err) {
      const msg = getErrorMessage(err);
      addToast('error', msg);
      throw err;
    }
  };

  // Movement Actions
  const handleCreateMovement = async (data: InventoryMovementRequest) => {
    try {
      const created = await inventoryService.createMovement(data);
      const actionName = created.movementType === 'IN' ? 'Received' : 'Dispatched';
      addToast(
        'success',
        `${actionName} ${created.quantity} ${created.unitSymbol} (${created.baseQuantity} ${created.baseUnitSymbol}) for "${created.productName}". Total: $${Number(created.totalAmount).toFixed(2)}`
      );
      await Promise.all([
        fetchAllProducts(),
        fetchPagedProducts(productQueryParams),
        fetchPagedMovements(movementFilterParams),
        fetchProductSummary(),
      ]);
    } catch (err) {
      const msg = getErrorMessage(err);
      addToast('error', msg);
      throw err;
    }
  };

  const handleDeleteMovement = async (id: number) => {
    try {
      await inventoryService.deleteMovement(id);
      addToast('success', `Movement record #${id} removed from history.`);
      await Promise.all([
        fetchAllProducts(),
        fetchPagedMovements(movementFilterParams),
        fetchProductSummary(),
      ]);
    } catch (err) {
      const msg = getErrorMessage(err);
      addToast('error', msg);
      throw err;
    }
  };

  const handleOpenMovementForProduct = (product: Product) => {
    setTargetProductForMovement(product);
    setIsQuickMovementModalOpen(true);
  };

  const lowStockCount = productSummary
    ? productSummary.lowStockCount
    : allProducts.filter((p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 10).length;

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <span className="text-sm font-medium text-slate-300">Connecting to SaaS Cloud...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderContent = () => {
    switch (currentTab) {
      case 'superadmin-tenants':
        return (
          <SuperAdminDashboard
            onInspectTenant={(tenant) => {
              setActiveTenantSlug(tenant.tenantSlug);
              setCurrentTab('products');
              handleRefresh();
            }}
            onShowToast={addToast}
          />
        );

      case 'tenant-admin':
        return (
          <TenantAdminDashboard
            onNavigate={setCurrentTab}
            onShowToast={addToast}
            productCount={productSummary?.totalProducts ?? allProducts.length}
            lowStockCount={lowStockCount}
          />
        );

      case 'inventory-manager':
        return (
          <InventoryManagerDashboard
            productSummary={productSummary}
            pagedProducts={pagedProducts}
            pagedMovements={pagedMovements}
            onOpenQuickProduct={() => setIsQuickProductModalOpen(true)}
            onOpenQuickMovement={() => setIsQuickMovementModalOpen(true)}
            onNavigate={setCurrentTab}
          />
        );

      case 'accountant-dashboard':
        return (
          <AccountantDashboard
            onNavigate={setCurrentTab}
            onShowToast={addToast}
          />
        );

      case 'cashier-dashboard':
        return (
          <CashierDashboard
            products={allProducts}
            categories={categories}
            onRefreshData={handleRefresh}
            addToast={addToast}
          />
        );

      case 'pos':
        return (
          <PosPage
            products={allProducts}
            categories={categories}
            onRefreshData={handleRefresh}
            addToast={addToast}
          />
        );

      case 'products':
        return (
          <ProductsPage
            pagedProducts={pagedProducts}
            categories={categories}
            units={units}
            taxRates={taxRates}
            summary={productSummary}
            isLoading={isProductsLoading}
            queryParams={productQueryParams}
            onQueryParamsChange={(params) => {
              setProductQueryParams(params);
              fetchPagedProducts(params);
            }}
            onCreateProduct={handleCreateProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onRestoreProduct={handleRestoreProduct}
            onOpenMovementModalForProduct={handleOpenMovementForProduct}
            onRefreshProducts={async () => {
              await Promise.all([fetchAllProducts(), fetchPagedProducts(productQueryParams), fetchProductSummary()]);
            }}
            onSeedData={handleSeedData}
          />
        );

      case 'categories':
        return (
          <CategoriesPage
            categories={categories}
            isLoading={isInitialLoading}
            onRefresh={fetchCategories}
            onCreateCategory={handleCreateCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        );

      case 'units':
        return (
          <UnitsPage
            units={units}
            isLoading={isInitialLoading}
            onRefresh={fetchUnits}
            onCreateUnit={handleCreateUnit}
            onUpdateUnit={handleUpdateUnit}
            onDeleteUnit={handleDeleteUnit}
          />
        );

      case 'tax-rates':
        return (
          <TaxRatesPage
            taxRates={taxRates}
            isLoading={isInitialLoading}
            onRefresh={fetchTaxRates}
            onCreateTaxRate={handleCreateTaxRate}
            onUpdateTaxRate={handleUpdateTaxRate}
            onDeleteTaxRate={handleDeleteTaxRate}
          />
        );

      case 'inventory':
        return (
          <InventoryPage
            products={allProducts}
            summary={productSummary}
            isLoading={isInitialLoading}
            onOpenMovementModalForProduct={handleOpenMovementForProduct}
          />
        );

      case 'movements':
        return (
          <MovementsPage
            pagedMovements={pagedMovements}
            products={allProducts}
            units={units}
            isLoading={isMovementsLoading}
            filterParams={movementFilterParams}
            onFilterChange={(params) => {
              setMovementFilterParams(params);
              fetchPagedMovements(params);
            }}
            onCreateMovement={handleCreateMovement}
            onDeleteMovement={handleDeleteMovement}
          />
        );

      case 'dashboard':
      default:
        return (
          <DashboardPage
            products={allProducts}
            categories={categories}
            recentMovements={pagedMovements?.content || []}
            taxRates={taxRates}
            summary={productSummary}
            isLoading={isInitialLoading}
            onNavigate={setCurrentTab}
            onOpenCreateProduct={() => setIsQuickProductModalOpen(true)}
            onOpenCreateCategory={() => setIsQuickCategoryModalOpen(true)}
            onOpenCreateMovement={() => {
              setTargetProductForMovement(null);
              setIsQuickMovementModalOpen(true);
            }}
            onOpenMovementForProduct={handleOpenMovementForProduct}
            onCreateTaxRate={handleCreateTaxRate}
            onUpdateTaxRate={handleUpdateTaxRate}
            onDeleteTaxRate={handleDeleteTaxRate}
          />
        );
    }
  };

  return (
    <>
      <Layout
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        lowStockCount={lowStockCount}
      >
        {renderContent()}
      </Layout>

      {/* Global Quick Action Modals */}
      <ProductFormModal
        isOpen={isQuickProductModalOpen}
        onClose={() => setIsQuickProductModalOpen(false)}
        onSubmit={async (data) => {
          await handleCreateProduct(data as ProductCreateRequest);
        }}
        categories={categories}
        units={units}
        taxRates={taxRates}
      />

      <CategoryFormModal
        isOpen={isQuickCategoryModalOpen}
        onClose={() => setIsQuickCategoryModalOpen(false)}
        onSubmit={async (data) => {
          await handleCreateCategory(data);
        }}
      />

      <TaxRateFormModal
        isOpen={isQuickTaxRateModalOpen}
        onClose={() => setIsQuickTaxRateModalOpen(false)}
        onSubmit={async (data) => {
          await handleCreateTaxRate(data);
        }}
      />

      <CreateMovementModal
        isOpen={isQuickMovementModalOpen}
        onClose={() => {
          setIsQuickMovementModalOpen(false);
          setTargetProductForMovement(null);
        }}
        onSubmit={handleCreateMovement}
        products={allProducts}
        units={units}
        selectedProduct={targetProductForMovement}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
