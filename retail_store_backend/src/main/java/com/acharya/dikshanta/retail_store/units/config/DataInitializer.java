package com.acharya.dikshanta.retail_store.units.config;

import com.acharya.dikshanta.retail_store.inventory.model.Inventory;
import com.acharya.dikshanta.retail_store.inventory.repository.InventoryRepository;
import com.acharya.dikshanta.retail_store.products.model.Category;
import com.acharya.dikshanta.retail_store.products.model.Product;
import com.acharya.dikshanta.retail_store.products.model.TaxRate;
import com.acharya.dikshanta.retail_store.products.repository.CategoryRepository;
import com.acharya.dikshanta.retail_store.products.repository.ProductRepository;
import com.acharya.dikshanta.retail_store.products.repository.TaxRateRepository;
import com.acharya.dikshanta.retail_store.units.enums.UnitType;
import com.acharya.dikshanta.retail_store.units.model.ProductUnitConversion;
import com.acharya.dikshanta.retail_store.units.model.Unit;
import com.acharya.dikshanta.retail_store.units.repository.ProductUnitConversionRepository;
import com.acharya.dikshanta.retail_store.units.repository.UnitRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UnitRepository unitRepository;
    private final ProductRepository productRepository;
    private final ProductUnitConversionRepository conversionRepository;
    private final CategoryRepository categoryRepository;
    private final TaxRateRepository taxRateRepository;
    private final InventoryRepository inventoryRepository;

    @Override
    public void run(String... args) {
        // Auto-seeding disabled to maintain clean database
    }

    @Transactional
    public void seedAllData() {
        seedUnits();
        seedTaxRates();
        seedCategoriesAndProducts();
        backfillProductsWithoutBaseUnit();
    }

    private void seedUnits() {
        createUnitIfNotExists("Kilogram", "KG", UnitType.WEIGHT);
        createUnitIfNotExists("Gram", "GRAM", UnitType.WEIGHT);
        createUnitIfNotExists("Liter", "LITER", UnitType.VOLUME);
        createUnitIfNotExists("Milliliter", "ML", UnitType.VOLUME);
        createUnitIfNotExists("Piece", "PIECE", UnitType.COUNT);
        createUnitIfNotExists("Packet", "PACKET", UnitType.COUNT);
        createUnitIfNotExists("Bora / Sack", "BORA", UnitType.OTHER);
        createUnitIfNotExists("Box", "BOX", UnitType.COUNT);
        createUnitIfNotExists("Carton", "CARTON", UnitType.COUNT);
        createUnitIfNotExists("Bag", "BAG", UnitType.OTHER);
        createUnitIfNotExists("Bottle", "BOTTLE", UnitType.COUNT);
    }

    private void createUnitIfNotExists(String name, String symbol, UnitType type) {
        if (!unitRepository.existsByNameIgnoreCase(name) && !unitRepository.existsBySymbolIgnoreCase(symbol)) {
            Unit unit = Unit.builder()
                    .name(name)
                    .symbol(symbol)
                    .unitType(type)
                    .build();
            unitRepository.save(unit);
            log.info("Seeded unit: {} ({})", name, symbol);
        }
    }

    private void seedTaxRates() {
        getOrCreateTaxRate(new BigDecimal("0.00"));
        getOrCreateTaxRate(new BigDecimal("5.00"));
        getOrCreateTaxRate(new BigDecimal("10.00"));
        getOrCreateTaxRate(new BigDecimal("13.00"));
        getOrCreateTaxRate(new BigDecimal("18.00"));
    }

    private TaxRate getOrCreateTaxRate(BigDecimal rate) {
        return taxRateRepository.findByRate(rate).orElseGet(() -> {
            TaxRate tr = TaxRate.builder().rate(rate).build();
            TaxRate saved = taxRateRepository.save(tr);
            log.info("Seeded tax rate: {}%", rate);
            return saved;
        });
    }

    private Category getOrCreateCategory(String name, String description) {
        return categoryRepository.findByName(name).orElseGet(() -> {
            Category cat = Category.builder()
                    .name(name)
                    .description(description)
                    .build();
            Category saved = categoryRepository.save(cat);
            log.info("Seeded category: {}", name);
            return saved;
        });
    }

    private Unit getUnitBySymbol(String symbol) {
        return unitRepository.findBySymbolIgnoreCase(symbol)
                .orElseGet(() -> unitRepository.findAll().stream().findFirst().orElseThrow());
    }

    private void seedCategoriesAndProducts() {
        // Categories
        Category groceries = getOrCreateCategory("Groceries & Staples", "Pantry essentials, grains, pulses, and cooking oils");
        Category beverages = getOrCreateCategory("Beverages & Juices", "Coffee, teas, bottled waters, and fruit juices");
        Category dairy = getOrCreateCategory("Dairy & Eggs", "Fresh milk, cheeses, butter, and farm eggs");
        Category bakery = getOrCreateCategory("Bakery & Breakfast", "Fresh breads, artisan pastries, cereals, and spreads");
        Category snacks = getOrCreateCategory("Snacks & Confectionery", "Chocolates, potato crisps, roasted nuts, and treats");
        Category produce = getOrCreateCategory("Fresh Produce", "Farm fresh fruits, leafy vegetables, and organics");
        Category household = getOrCreateCategory("Household & Cleaning", "Detergents, dish soaps, paper products, and supplies");
        Category personal = getOrCreateCategory("Personal Care", "Bath soaps, shampoos, skincare, and oral hygiene");

        // Tax Rates
        TaxRate tax0 = getOrCreateTaxRate(new BigDecimal("0.00"));
        TaxRate tax5 = getOrCreateTaxRate(new BigDecimal("5.00"));
        TaxRate tax10 = getOrCreateTaxRate(new BigDecimal("10.00"));
        TaxRate tax13 = getOrCreateTaxRate(new BigDecimal("13.00"));
        TaxRate tax18 = getOrCreateTaxRate(new BigDecimal("18.00"));

        // Units
        Unit kg = getUnitBySymbol("KG");
        Unit gram = getUnitBySymbol("GRAM");
        Unit liter = getUnitBySymbol("LITER");
        Unit ml = getUnitBySymbol("ML");
        Unit piece = getUnitBySymbol("PIECE");
        Unit packet = getUnitBySymbol("PACKET");
        Unit box = getUnitBySymbol("BOX");
        Unit bottle = getUnitBySymbol("BOTTLE");

        // 1. Groceries (10 items)
        seedProduct("Himalayan Basmati Rice 5kg", "GROC-BASM-001", "Aged long-grain aromatic basmati rice for biryani and daily meals", new BigDecimal("16.50"), groceries, kg, tax5, new BigDecimal("45.0000"));
        seedProduct("Organic Whole Wheat Flour", "GROC-WFLR-002", "100% stone-ground unbleached whole wheat flour rich in fiber", new BigDecimal("4.20"), groceries, kg, tax0, new BigDecimal("80.0000"));
        seedProduct("Cold Pressed Sunflower Oil 1L", "GROC-SOIL-003", "Heart-healthy unrefined virgin cooking sunflower seed oil", new BigDecimal("12.80"), groceries, liter, tax13, new BigDecimal("25.0000"));
        seedProduct("Extra Virgin Olive Oil 500ml", "GROC-EVOO-004", "First cold-pressed Mediterranean extra virgin olive oil", new BigDecimal("18.99"), groceries, ml, tax13, new BigDecimal("6.0000")); // Low stock
        seedProduct("Refined Pure Cane Sugar 1kg", "GROC-SUGR-005", "Crystal white granulated pure sugarcane sweetening agent", new BigDecimal("2.10"), groceries, kg, tax5, new BigDecimal("150.0000"));
        seedProduct("Himalayan Pink Rock Salt", "GROC-SLTH-006", "Mineral-rich unrefined pink crystal salt from salt range mines", new BigDecimal("3.50"), groceries, gram, tax0, new BigDecimal("90.0000"));
        seedProduct("Split Red Lentils (Masoor Dal)", "GROC-RDAL-007", "Fast-cooking protein-packed red split lentils for curries and soups", new BigDecimal("3.80"), groceries, kg, tax0, new BigDecimal("65.0000"));
        seedProduct("Organic Whole Chickpeas (Garbanzo)", "GROC-CHCK-008", "Nutrient-dense dried garbanzo beans perfect for hummus and salads", new BigDecimal("4.50"), groceries, kg, tax0, new BigDecimal("40.0000"));
        seedProduct("Golden Organic Quinoa Grain", "GROC-QUIA-009", "Complete plant protein superfood grain grown sustainably", new BigDecimal("9.20"), groceries, kg, tax5, BigDecimal.ZERO); // Out of stock
        seedProduct("Rolled Whole Grain Oats 1kg", "GROC-OATS-010", "Hearty dietary breakfast oats with soluble beta-glucan fibers", new BigDecimal("5.40"), groceries, packet, tax5, new BigDecimal("35.0000"));

        // 2. Beverages (10 items)
        seedProduct("Artisan Roasted Arabica Coffee Beans", "BEV-ARAB-011", "Single-origin high-altitude Arabica whole beans with chocolate notes", new BigDecimal("22.50"), beverages, packet, tax13, new BigDecimal("30.0000"));
        seedProduct("Dark Roast Espresso Ground Coffee", "BEV-ESPR-012", "Bold intense espresso blend ground for moka pot and espresso machines", new BigDecimal("14.20"), beverages, packet, tax13, new BigDecimal("4.0000")); // Low stock
        seedProduct("Organic Earl Grey Black Tea", "BEV-EARL-013", "Ceylon black tea infused with natural Italian bergamot essential oil", new BigDecimal("8.90"), beverages, box, tax5, new BigDecimal("55.0000"));
        seedProduct("Japanese Sencha Green Tea", "BEV-GRNT-014", "Steamed first-flush green tea leaves rich in natural antioxidants", new BigDecimal("11.50"), beverages, box, tax5, new BigDecimal("28.0000"));
        seedProduct("Natural Sparkling Mineral Water 1L", "BEV-SPAR-015", "Refreshing mineral water naturally carbonated from mountain springs", new BigDecimal("1.80"), beverages, bottle, tax13, new BigDecimal("200.0000"));
        seedProduct("Pure Squeezed Orange Juice 1L", "BEV-OJUC-016", "Never from concentrate 100% Florida orange juice with tender pulp", new BigDecimal("4.99"), beverages, liter, tax13, new BigDecimal("8.0000")); // Low stock
        seedProduct("Crisp Cloudy Apple Juice 1L", "BEV-AJUC-017", "Cold-pressed orchard fresh unfiltered apple juice with no added sugar", new BigDecimal("3.80"), beverages, liter, tax13, new BigDecimal("32.0000"));
        seedProduct("Unsweetened Almond Milk 1L", "BEV-ALMD-018", "Plant-based dairy-free almond beverage fortified with Calcium and Vitamin D", new BigDecimal("3.60"), beverages, liter, tax5, new BigDecimal("45.0000"));
        seedProduct("Barista Edition Oat Milk 1L", "BEV-OATM-019", "Creamy micro-foamable oat drink engineered for specialty lattes", new BigDecimal("4.25"), beverages, liter, tax5, BigDecimal.ZERO); // Out of stock
        seedProduct("Organic Tender Coconut Water 500ml", "BEV-COCO-020", "Electrolyte-replenishing natural isotonic coconut water", new BigDecimal("2.95"), beverages, bottle, tax13, new BigDecimal("75.0000"));

        // 3. Dairy & Eggs (8 items)
        seedProduct("Farm Fresh Whole Milk 1L", "DAIR-MILK-021", "Pasteurized homogenized full-cream dairy milk from pasture cows", new BigDecimal("2.40"), dairy, liter, tax0, new BigDecimal("60.0000"));
        seedProduct("Low-Fat Skimmed Milk 1L", "DAIR-SKIM-022", "Light 1% fat pasteurized milk enriched with essential vitamins", new BigDecimal("2.30"), dairy, liter, tax0, new BigDecimal("40.0000"));
        seedProduct("Free-Range Large Brown Eggs 12pk", "DAIR-EGGS-023", "Farm collected dozen grade-A large brown eggs with rich golden yolks", new BigDecimal("5.20"), dairy, box, tax0, new BigDecimal("50.0000"));
        seedProduct("Grass-Fed Salted Butter 250g", "DAIR-BUTR-024", "Churned cream golden butter with a pinch of sea salt for baking and toast", new BigDecimal("4.80"), dairy, piece, tax5, new BigDecimal("7.0000")); // Low stock
        seedProduct("Aged Sharp Cheddar Cheese 200g", "DAIR-CHED-025", "Matured for 12 months with robust savory sharpness and crumbly texture", new BigDecimal("6.50"), dairy, piece, tax13, new BigDecimal("22.0000"));
        seedProduct("Fresh Mozzarella Ball 125g", "DAIR-MOZZ-026", "Tender porcelain white mozzarella ball soaked in brine for caprese", new BigDecimal("3.90"), dairy, piece, tax5, new BigDecimal("18.0000"));
        seedProduct("Authentic Greek Yogurt 500g", "DAIR-GREE-027", "Strained rich yogurt with 10% fat and 15g protein per serving", new BigDecimal("4.60"), dairy, piece, tax5, new BigDecimal("35.0000"));
        seedProduct("Parmigiano Reggiano Wedge 150g", "DAIR-PARM-028", "DOP certified Italian hard grating cheese aged for 24 months", new BigDecimal("12.50"), dairy, piece, tax13, new BigDecimal("3.0000")); // Low stock

        // 4. Bakery & Breakfast (6 items)
        seedProduct("Artisan Sourdough Boule Loaf", "BAKE-SOUR-029", "Naturally fermented wild yeast bread with crunchy crust and chewy crumb", new BigDecimal("5.50"), bakery, piece, tax0, new BigDecimal("25.0000"));
        seedProduct("Whole Grain Sandwich Toast Bread", "BAKE-WBRD-030", "Soft sliced sandwich bread enriched with 7 multi-grains and seeds", new BigDecimal("3.20"), bakery, packet, tax0, new BigDecimal("45.0000"));
        seedProduct("Butter Croissant 4-Pack", "BAKE-CROI-031", "Flaky layered French viennoiserie pastry made with pure butter", new BigDecimal("6.00"), bakery, box, tax5, BigDecimal.ZERO); // Out of stock
        seedProduct("New York Style Plain Bagels 6pk", "BAKE-BAGL-032", "Boiled and baked traditional chewy breakfast bagels", new BigDecimal("4.50"), bakery, packet, tax5, new BigDecimal("20.0000"));
        seedProduct("Organic Buttermilk Pancake Mix", "BAKE-PANC-033", "Just add water and egg for fluffy golden weekend breakfast pancakes", new BigDecimal("4.95"), bakery, packet, tax5, new BigDecimal("30.0000"));
        seedProduct("Pure Canadian Maple Syrup 250ml", "BAKE-MAPL-034", "Grade A amber rich taste 100% pure maple tree sap syrup", new BigDecimal("14.50"), bakery, bottle, tax13, new BigDecimal("15.0000"));

        // 5. Snacks & Confectionery (6 items)
        seedProduct("70% Dark Belgian Chocolate Bar", "SNAK-CHOC-035", "Single-origin cocoa mass crafted with delicate vanilla beans", new BigDecimal("3.80"), snacks, piece, tax13, new BigDecimal("85.0000"));
        seedProduct("Sea Salt & Cider Vinegar Kettle Chips", "SNAK-CHIP-036", "Hand-cooked thick cut potato chips with tangy vinegar seasoning", new BigDecimal("2.99"), snacks, packet, tax13, new BigDecimal("60.0000"));
        seedProduct("Roasted Salted California Almonds", "SNAK-ALMD-037", "Crunchy oven-roasted premium almonds lightly dusted with sea salt", new BigDecimal("9.50"), snacks, packet, tax5, new BigDecimal("40.0000"));
        seedProduct("Raw Organic Whole Cashews 250g", "SNAK-CASW-038", "Sweet buttery unroasted whole cashew nuts grade W240", new BigDecimal("11.00"), snacks, packet, tax5, new BigDecimal("5.0000")); // Low stock
        seedProduct("Fruity Gummy Bears 150g", "SNAK-GUMM-039", "Classic chewy gummy candies bursting with natural fruit flavors", new BigDecimal("2.20"), snacks, packet, tax18, new BigDecimal("110.0000"));
        seedProduct("Honey Almond Protein Granola Bars", "SNAK-GRAN-040", "Pack of 5 chewy oat bars with 10g plant protein per serving", new BigDecimal("6.80"), snacks, box, tax13, new BigDecimal("25.0000"));

        // 6. Fresh Produce (5 items)
        seedProduct("Crisp Honeycrisp Apples 1kg", "PROD-APPL-041", "Orchard-picked juicy sweet apples with signature explosive crunch", new BigDecimal("3.99"), produce, kg, tax0, new BigDecimal("120.0000"));
        seedProduct("Fairtrade Organic Cavendish Bananas", "PROD-BANA-042", "Freshly ripened pesticide-free tropical bananas rich in potassium", new BigDecimal("1.89"), produce, kg, tax0, new BigDecimal("180.0000"));
        seedProduct("Hass Avocados 4-Pack Net", "PROD-AVOC-043", "Creamy dark green ripe Hass avocados for guacamole and toast", new BigDecimal("5.99"), produce, box, tax0, new BigDecimal("9.0000")); // Low stock
        seedProduct("Vine Ripened Red Roma Tomatoes", "PROD-TOMA-044", "Sun-ripened firm Italian plum tomatoes for hearty sauces and salads", new BigDecimal("3.20"), produce, kg, tax0, new BigDecimal("85.0000"));
        seedProduct("Baby Spinach Clamshell 250g", "PROD-SPIN-045", "Triple-washed tender organic baby spinach leaves ready to eat", new BigDecimal("3.50"), produce, box, tax0, BigDecimal.ZERO); // Out of stock

        // 7. Household & Cleaning (3 items)
        seedProduct("Eco Citrus Dishwashing Liquid 750ml", "HOUS-DISH-046", "Grease-cutting biodegradable plant formulation with refreshing lemon oils", new BigDecimal("4.20"), household, bottle, tax18, new BigDecimal("50.0000"));
        seedProduct("Concentrated Laundry Detergent 2L", "HOUS-LDET-047", "Deep cleaning enzyme formula suitable for high efficiency front loaders", new BigDecimal("16.90"), household, bottle, tax18, new BigDecimal("24.0000"));
        seedProduct("Heavy Duty Drawstring Trash Bags 30ct", "HOUS-TRSH-048", "Puncture-resistant tear-proof 50-liter kitchen refuse sacks", new BigDecimal("7.50"), household, box, tax18, new BigDecimal("35.0000"));

        // 8. Personal Care (4 items)
        seedProduct("Lavender Moisturizing Bar Soap 100g", "PERS-SOAP-049", "Cold-saponified moisturizing olive and shea butter bath bar", new BigDecimal("2.50"), personal, piece, tax13, new BigDecimal("70.0000"));
        seedProduct("Organic Argan Oil Revitalizing Shampoo", "PERS-SHMP-050", "Sulfate-free nourishing hair cleanser for dry and damaged hair", new BigDecimal("13.99"), personal, bottle, tax18, new BigDecimal("2.0000")); // Low stock
        seedProduct("Natural Herbal Whitening Toothpaste", "PERS-TOTH-051", "Fluoride mineral toothpaste with cooling peppermint and baking soda", new BigDecimal("4.50"), personal, piece, tax13, new BigDecimal("65.0000"));
        seedProduct("Refreshing Citrus Body Wash 500ml", "PERS-BODW-052", "Vitamin C and aloe vera foaming shower gel for gentle cleansing", new BigDecimal("8.90"), personal, bottle, tax18, BigDecimal.ZERO); // Out of stock

        log.info("Finished seeding 52 realistic catalog products with inventory and tax rates.");
    }

    private void seedProduct(
            String name,
            String sku,
            String description,
            BigDecimal price,
            Category category,
            Unit baseUnit,
            TaxRate taxRate,
            BigDecimal initialStock
    ) {
        if (!productRepository.existsByNameOrSku(name, sku)) {
            Product product = Product.builder()
                    .name(name)
                    .sku(sku)
                    .description(description)
                    .price(price)
                    .category(category)
                    .baseUnit(baseUnit)
                    .taxRate(taxRate)
                    .build();

            ProductUnitConversion baseConversion = ProductUnitConversion.builder()
                    .product(product)
                    .unit(baseUnit)
                    .conversionFactor(BigDecimal.ONE)
                    .active(true)
                    .build();
            product.addUnitConversion(baseConversion);

            Product savedProduct = productRepository.save(product);

            Inventory inventory = Inventory.builder()
                    .product(savedProduct)
                    .stock(initialStock)
                    .build();
            inventoryRepository.save(inventory);

            savedProduct.setInventory(inventory);
            productRepository.save(savedProduct);

            log.info("Seeded product: {} ({}) with initial stock {}", name, sku, initialStock);
        }
    }

    private void backfillProductsWithoutBaseUnit() {
        Unit defaultUnit = unitRepository.findBySymbolIgnoreCase("PIECE")
                .or(() -> unitRepository.findAll().stream().findFirst())
                .orElse(null);

        if (defaultUnit == null) return;

        List<Product> products = productRepository.findAll();
        for (Product product : products) {
            if (product.getActive() == null) {
                product.setActive(true);
                productRepository.save(product);
            }
            if (product.getBaseUnit() == null) {
                product.setBaseUnit(defaultUnit);
                productRepository.save(product);

                if (!conversionRepository.existsByProductIdAndUnitId(product.getId(), defaultUnit.getId())) {
                    ProductUnitConversion conversion = ProductUnitConversion.builder()
                            .product(product)
                            .unit(defaultUnit)
                            .conversionFactor(BigDecimal.ONE)
                            .active(true)
                            .build();
                    conversionRepository.save(conversion);
                }
                log.info("Assigned default base unit {} to existing product {}", defaultUnit.getSymbol(), product.getName());
            }
        }
    }
}
