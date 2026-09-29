import { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/layout/Layout';
import type { NavTab } from './components/layout/Sidebar';
import { ToastContainer, type ToastMessage } from './components/common/Toast';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { ProductsPage } from './pages/Products/ProductsPage';
import { CategoriesPage } from './pages/Categories/CategoriesPage';
import { UnitsPage } from './pages/Units/UnitsPage';
import { InventoryPage } from './pages/Inventory/InventoryPage';
import { MovementsPage } from './pages/InventoryMovements/MovementsPage';
import { ProductFormModal } from './pages/Products/ProductFormModal';
import { CategoryFormModal } from './pages/Categories/CategoryFormModal';
import { CreateMovementModal } from './pages/InventoryMovements/CreateMovementModal';

import { productService } from './api/productService';
import { categoryService } from './api/categoryService';
import { unitService } from './api/unitService';
import { inventoryService } from './api/inventoryService';
import { getErrorMessage } from './api/client';

import type { Product, ProductCreateRequest, ProductUpdateRequest } from './types/product';
import type { Category, CategoryRequest } from './types/category';
import type { Unit, UnitRequest } from './types/unit';
import type { InventoryMovement, InventoryMovementRequest } from './types/inventory';
import type { PagedResponse, PaginationParams } from './types/api';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Data states
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [pagedProducts, setPagedProducts] = useState<PagedResponse<Product> | null>(null);
  const [pagedMovements, setPagedMovements] = useState<PagedResponse<InventoryMovement> | null>(null);

  // Pagination states
  const [productPagination, setProductPagination] = useState<PaginationParams>({
    page: 0,
    size: 10,
    sort: 'id',
    direction: 'asc',
  });

  const [movementPagination, setMovementPagination] = useState<PaginationParams>({
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
    } catch (err) {
      addToast('error', getErrorMessage(err));
    }
  }, [addToast]);

  // Fetch all units
  const fetchUnits = useCallback(async () => {
    try {
      const data = await unitService.getAllUnits();
      setUnits(data);
    } catch (err) {
      addToast('error', getErrorMessage(err));
    }
  }, [addToast]);

  // Fetch paginated products for Products tab
  const fetchPagedProducts = useCallback(async (params: PaginationParams) => {
    setIsProductsLoading(true);
    try {
      const res = await productService.getAllProducts(params);
      setPagedProducts(res);
    } catch (err) {
      addToast('error', getErrorMessage(err));
    } finally {
      setIsProductsLoading(false);
    }
  }, [addToast]);

  // Fetch full products list for Dashboard, Inventory, & select dropdowns
  const fetchAllProducts = useCallback(async () => {
    try {
      const res = await productService.getAllProducts({ page: 0, size: 1000, sort: 'id', direction: 'asc' });
      setAllProducts(res.content);
    } catch (err) {
      addToast('error', getErrorMessage(err));
    }
  }, [addToast]);

  // Fetch paginated movements
  const fetchPagedMovements = useCallback(async (params: PaginationParams) => {
    setIsMovementsLoading(true);
    try {
      const res = await inventoryService.getAllMovements(params);
      setPagedMovements(res);
    } catch (err) {
      addToast('error', getErrorMessage(err));
    } finally {
      setIsMovementsLoading(false);
    }
  }, [addToast]);

  // Initial load
  useEffect(() => {
    let isMounted = true;
    async function loadAll() {
      setIsInitialLoading(true);
      await Promise.all([
        fetchCategories(),
        fetchUnits(),
        fetchAllProducts(),
        fetchPagedProducts(productPagination),
        fetchPagedMovements(movementPagination),
      ]);
      if (isMounted) {
        setIsInitialLoading(false);
      }
    }
    loadAll();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh current active view
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchCategories(),
        fetchUnits(),
        fetchAllProducts(),
        fetchPagedProducts(productPagination),
        fetchPagedMovements(movementPagination),
      ]);
      addToast('info', 'Store data refreshed successfully');
    } catch (err) {
      addToast('error', getErrorMessage(err));
    } finally {
      setIsRefreshing(false);
    }
  };

  // Product Actions
  const handleCreateProduct = async (data: ProductCreateRequest) => {
    try {
      const created = await productService.createProduct(data);
      addToast('success', `Product "${created.name}" created successfully with base unit ${created.baseUnitSymbol || ''}.`);
      await Promise.all([fetchAllProducts(), fetchPagedProducts(productPagination)]);
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
      await Promise.all([fetchAllProducts(), fetchPagedProducts(productPagination)]);
    } catch (err) {
      const msg = getErrorMessage(err);
      addToast('error', msg);
      throw err;
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      const deleted = await productService.deleteProduct(id);
      addToast('success', `Product "${deleted.name}" deleted successfully.`);
      await Promise.all([fetchAllProducts(), fetchPagedProducts(productPagination)]);
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
      await Promise.all([fetchCategories(), fetchAllProducts(), fetchPagedProducts(productPagination)]);
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
      await Promise.all([fetchCategories(), fetchAllProducts(), fetchPagedProducts(productPagination)]);
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
      addToast('success', `Unit "${created.name} (${created.symbol})" created successfully.`);
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

  // Movement Actions
  const handleCreateMovement = async (data: InventoryMovementRequest) => {
    try {
      const created = await inventoryService.createMovement(data);
      const actionName = created.movementType === 'IN' ? 'Received' : 'Dispatched';
      addToast(
        'success',
        `${actionName} ${created.quantity} ${created.unitSymbol} (${created.baseQuantity} ${created.baseUnitSymbol}) for "${created.productName}". Total: $${Number(created.totalAmount).toFixed(2)}`
      );
      // Refresh inventory and movements
      await Promise.all([
        fetchAllProducts(),
        fetchPagedProducts(productPagination),
        fetchPagedMovements(movementPagination),
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
      await fetchPagedMovements(movementPagination);
    } catch (err) {
      const msg = getErrorMessage(err);
      addToast('error', msg);
      throw err;
    }
  };

  // Shortcut to open Movement Modal for specific product
  const handleOpenMovementForProduct = (product: Product) => {
    setTargetProductForMovement(product);
    setIsQuickMovementModalOpen(true);
  };

  const lowStockCount = allProducts.filter((p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 10).length;

  return (
    <Layout
      currentTab={currentTab}
      onTabChange={setCurrentTab}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
      lowStockCount={lowStockCount}
    >
      {/* Toast alert system */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Page Routing */}
      {currentTab === 'dashboard' && (
        <DashboardPage
          products={allProducts}
          categories={categories}
          recentMovements={pagedMovements?.content || []}
          isLoading={isInitialLoading}
          onNavigate={setCurrentTab}
          onOpenCreateProduct={() => setIsQuickProductModalOpen(true)}
          onOpenCreateCategory={() => setIsQuickCategoryModalOpen(true)}
          onOpenCreateMovement={() => {
            setTargetProductForMovement(null);
            setIsQuickMovementModalOpen(true);
          }}
          onOpenMovementForProduct={handleOpenMovementForProduct}
        />
      )}

      {currentTab === 'products' && (
        <ProductsPage
          pagedProducts={pagedProducts}
          categories={categories}
          units={units}
          isLoading={isProductsLoading}
          paginationParams={productPagination}
          onPaginationChange={(params) => {
            setProductPagination(params);
            fetchPagedProducts(params);
          }}
          onCreateProduct={handleCreateProduct}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
          onOpenMovementModalForProduct={handleOpenMovementForProduct}
          onRefreshProducts={async () => {
            await Promise.all([fetchAllProducts(), fetchPagedProducts(productPagination)]);
          }}
        />
      )}

      {currentTab === 'categories' && (
        <CategoriesPage
          categories={categories}
          isLoading={isInitialLoading}
          onRefresh={fetchCategories}
          onCreateCategory={handleCreateCategory}
          onUpdateCategory={handleUpdateCategory}
          onDeleteCategory={handleDeleteCategory}
        />
      )}

      {currentTab === 'units' && (
        <UnitsPage
          units={units}
          isLoading={isInitialLoading}
          onRefresh={fetchUnits}
          onCreateUnit={handleCreateUnit}
          onUpdateUnit={handleUpdateUnit}
          onDeleteUnit={handleDeleteUnit}
        />
      )}

      {currentTab === 'inventory' && (
        <InventoryPage
          products={allProducts}
          isLoading={isInitialLoading}
          onOpenMovementModalForProduct={handleOpenMovementForProduct}
        />
      )}

      {currentTab === 'movements' && (
        <MovementsPage
          pagedMovements={pagedMovements}
          products={allProducts}
          units={units}
          isLoading={isMovementsLoading}
          paginationParams={movementPagination}
          onPaginationChange={(params) => {
            setMovementPagination(params);
            fetchPagedMovements(params);
          }}
          onCreateMovement={handleCreateMovement}
          onDeleteMovement={handleDeleteMovement}
        />
      )}

      {/* Global Action Modals */}
      <ProductFormModal
        isOpen={isQuickProductModalOpen}
        onClose={() => setIsQuickProductModalOpen(false)}
        onSubmit={async (data) => {
          await handleCreateProduct(data as ProductCreateRequest);
        }}
        categories={categories}
        units={units}
      />

      <CategoryFormModal
        isOpen={isQuickCategoryModalOpen}
        onClose={() => setIsQuickCategoryModalOpen(false)}
        onSubmit={async (data) => {
          await handleCreateCategory(data);
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
    </Layout>
  );
}

export default App;
