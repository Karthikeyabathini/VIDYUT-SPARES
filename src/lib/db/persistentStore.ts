import fs from 'fs';
import path from 'path';
import { Category, Product, Order, Payment, Invoice, Address, PaymentMethod, UserProfile, StoreConfig, AdminAuditLog } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const DB_FILE = path.join(DATA_DIR, 'persistent-db.json');

const DEFAULT_STORE_CONFIG: StoreConfig = {
  business_name: 'VIDYUT SPARES',
  store_phone: '9440146599',
  store_email: 'vidyutspares@gmail.com',
  store_address: '11-39-15, Katurivari St, Beside 1 Town Police Station, Tarapet, Vijayawada, Andhra Pradesh 520001, India',
  gstin: '37AAAAA0000A1Z5',
  support_hours: 'Mon - Sat: 9:00 AM - 8:30 PM (IST)',
  updated_at: new Date().toISOString(),
};

const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'c1111111-1111-1111-1111-111111111111',
    name: 'Switches & Sockets',
    slug: 'switches-sockets',
    description: 'Premium modular switches, socket outlets, regulators, and face plates for home & commercial installation.',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'c2222222-2222-2222-2222-222222222222',
    name: 'Wires & Cables',
    slug: 'wires-cables',
    description: 'High-grade flame retardant copper wires, flexible cables, and heavy-duty industrial cables.',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'c3333333-3333-3333-3333-333333333333',
    name: 'Circuit Protection (MCB / RCCB)',
    slug: 'circuit-protection',
    description: 'Miniature circuit breakers, residual current breakers, distribution boards, and isolators.',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'c4444444-4444-4444-4444-444444444444',
    name: 'LED Lighting & Fixtures',
    slug: 'led-lighting',
    description: 'Energy efficient LED panel lights, tube lights, flood lights, and commercial downlights.',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'c5555555-5555-5555-5555-555555555555',
    name: 'Conduits & Fitting Spares',
    slug: 'conduits-fittings',
    description: 'PVC conduits, junction boxes, circular boxes, bend pipes, and heavy clamps.',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'c6666666-6666-6666-6666-666666666666',
    name: 'Electrical Tools & Hardware',
    slug: 'tools-hardware',
    description: 'Insulated pliers, wire strippers, voltage testers, insulation tapes, and cable ties.',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1010101-0000-0000-0000-000000000001',
    category_id: 'c1111111-1111-1111-1111-111111111111',
    name: '16A 1-Way Modular Switch (White)',
    slug: '16a-1way-modular-switch-white',
    sku: 'VS-SW-016',
    brand: 'Havells',
    description: 'Heavy duty 16 amp 240V 1-way modular switch for AC, water heater, and power socket control.',
    price: 95.00,
    stock_quantity: 150,
    low_stock_threshold: 20,
    image_url: '/vs-logo.svg',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'p1010101-0000-0000-0000-000000000002',
    category_id: 'c1111111-1111-1111-1111-111111111111',
    name: '6A 3-Pin Modular Socket Outlet',
    slug: '6a-3pin-modular-socket-outlet',
    sku: 'VS-SK-006',
    brand: 'Anchor Mona',
    description: 'Safety shuttered 6 amp 3-pin modular socket with fire resistant polycarbonate body.',
    price: 75.00,
    stock_quantity: 200,
    low_stock_threshold: 25,
    image_url: '/vs-logo.svg',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'p1010101-0000-0000-0000-000000000003',
    category_id: 'c2222222-2222-2222-2222-222222222222',
    name: '2.5 sq mm FR PVC Insulated Copper Wire (90m Roll)',
    slug: '25-sqmm-fr-pvc-copper-wire-90m',
    sku: 'VS-WR-025',
    brand: 'Finolex',
    description: 'High purity 99.9% electrolytic grade copper wire roll for house wiring and power circuits.',
    price: 2450.00,
    stock_quantity: 35,
    low_stock_threshold: 5,
    image_url: '/vs-logo.svg',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'p1010101-0000-0000-0000-000000000004',
    category_id: 'c2222222-2222-2222-2222-222222222222',
    name: '1.5 sq mm Flame Retardant Wire (90m Red)',
    slug: '15-sqmm-fr-wire-90m-red',
    sku: 'VS-WR-015',
    brand: 'Polycab',
    description: 'Premium insulation 1.5 sq mm single core wire suitable for lighting and switch connections.',
    price: 1650.00,
    stock_quantity: 40,
    low_stock_threshold: 8,
    image_url: '/vs-logo.svg',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'p1010101-0000-0000-0000-000000000005',
    category_id: 'c3333333-3333-3333-3333-333333333333',
    name: '32A Double Pole C-Curve MCB (10kA)',
    slug: '32a-double-pole-c-curve-mcb',
    sku: 'VS-MCB-032DP',
    brand: 'Legrand',
    description: 'High breaking capacity 32 Amp DP MCB for short circuit and overload safety protection.',
    price: 680.00,
    stock_quantity: 25,
    low_stock_threshold: 5,
    image_url: '/vs-logo.svg',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'p1010101-0000-0000-0000-000000000006',
    category_id: 'c3333333-3333-3333-3333-333333333333',
    name: '16A Single Pole MCB (C-Series)',
    slug: '16a-single-pole-mcb-c-series',
    sku: 'VS-MCB-016SP',
    brand: 'Schneider',
    description: 'Compact single pole MCB for sub-circuit protection in residential and commercial DB panels.',
    price: 180.00,
    stock_quantity: 80,
    low_stock_threshold: 10,
    image_url: '/vs-logo.svg',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'p1010101-0000-0000-0000-000000000007',
    category_id: 'c4444444-4444-4444-4444-444444444444',
    name: '18W LED Slim Panel Light (Cool Day Light 6500K)',
    slug: '18w-led-slim-panel-light',
    sku: 'VS-LED-018P',
    brand: 'Philips',
    description: 'Ultra-thin recessed ceiling LED panel light providing glare-free uniform illumination.',
    price: 420.00,
    stock_quantity: 50,
    low_stock_threshold: 10,
    image_url: '/vs-logo.svg',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'p1010101-0000-0000-0000-000000000008',
    category_id: 'c4444444-4444-4444-4444-444444444444',
    name: '9W Cool White LED Bulb (B22 Cap)',
    slug: '9w-cool-white-led-bulb-b22',
    sku: 'VS-LED-009B',
    brand: 'Crompton',
    description: 'Surge protected 9 watt LED bulb with up to 100 lm/W high lumens output.',
    price: 90.00,
    stock_quantity: 120,
    low_stock_threshold: 15,
    image_url: '/vs-logo.svg',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'p1010101-0000-0000-0000-000000000009',
    category_id: 'c5555555-5555-5555-5555-555555555555',
    name: '25mm Heavy Duty PVC Conduit Pipe (3m Length)',
    slug: '25mm-heavy-duty-pvc-conduit-pipe',
    sku: 'VS-CND-025',
    brand: 'Sudhakar',
    description: 'Rigid unplasticized PVC electrical conduit pipe for underground and concealed wall fitting.',
    price: 85.00,
    stock_quantity: 100,
    low_stock_threshold: 20,
    image_url: '/vs-logo.svg',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'p1010101-0000-0000-0000-000000000010',
    category_id: 'c6666666-6666-6666-6666-666666666666',
    name: 'Heavy Duty Insulated Combination Pliers (8 inch)',
    slug: 'heavy-duty-insulated-combination-pliers-8inch',
    sku: 'VS-TL-PLI08',
    brand: 'Taparia',
    description: 'High resistance 1000V insulated grip pliers for cutting, holding, and twisting electrical wires.',
    price: 340.00,
    stock_quantity: 30,
    low_stock_threshold: 4,
    image_url: '/vs-logo.svg',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const INITIAL_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'm1111111-0000-0000-0000-000000000001',
    type: 'UPI_NUMBER',
    display_name: 'VIDYUT SPARES PhonePe / GPay Number',
    provider: 'PhonePe & GPay',
    phone_number: '9440146599',
    upi_id: '9440146599@ybl',
    qr_image_url: '/vs-logo.svg',
    instructions: 'Transfer exact order amount to 9440146599. Copy the 12-digit UTR transaction ID and upload payment screenshot.',
    is_active: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'm2222222-0000-0000-0000-000000000002',
    type: 'UPI_QR',
    display_name: 'VIDYUT SPARES Official UPI QR Scan',
    provider: 'BHIM / All UPI Apps',
    phone_number: null,
    upi_id: 'vidyutspares@okicici',
    qr_image_url: '/vs-logo.svg',
    instructions: 'Scan the QR code using any UPI application (PhonePe, GPay, Paytm, BHIM). Save receipt and submit UTR number.',
    is_active: true,
    sort_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'm3333333-0000-0000-0000-000000000003',
    type: 'BANK_TRANSFER',
    display_name: 'HDFC Bank Account Transfer',
    provider: 'HDFC Bank Tarapet',
    phone_number: '9440146599',
    upi_id: null,
    qr_image_url: '/vs-logo.svg',
    instructions: 'Pay via NEFT / RTGS / IMPS to VIDYUT SPARES. Enter transaction reference number and upload credit advice screenshot.',
    is_active: true,
    sort_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

interface SchemaStore {
  categories: Category[];
  products: Product[];
  orders: Order[];
  payments: Payment[];
  invoices: Invoice[];
  addresses: Address[];
  payment_methods: PaymentMethod[];
  users: UserProfile[];
  store_config?: StoreConfig;
  audit_logs?: AdminAuditLog[];
}

function ensureDataFile(): SchemaStore {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
      const initialStore: SchemaStore = {
        categories: INITIAL_CATEGORIES,
        products: INITIAL_PRODUCTS,
        orders: [],
        payments: [],
        invoices: [],
        addresses: [],
        payment_methods: INITIAL_PAYMENT_METHODS,
        users: [
          {
            id: 'c0000000-0000-0000-0000-000000000001',
            name: 'VIDYUT SPARES Store Admin',
            email: 'admin@vidyutspares.com',
            phone: '9440146599',
            role: 'ADMIN',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
        store_config: DEFAULT_STORE_CONFIG,
        audit_logs: [],
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialStore, null, 2), 'utf8');
      return initialStore;
    }

    const content = fs.readFileSync(DB_FILE, 'utf8');
    const parsed: SchemaStore = JSON.parse(content);
    if (!parsed.categories || parsed.categories.length === 0) parsed.categories = INITIAL_CATEGORIES;
    if (!parsed.products || parsed.products.length === 0) parsed.products = INITIAL_PRODUCTS;
    if (!parsed.payment_methods || parsed.payment_methods.length === 0) parsed.payment_methods = INITIAL_PAYMENT_METHODS;
    if (!parsed.store_config) parsed.store_config = DEFAULT_STORE_CONFIG;
    if (!parsed.audit_logs) parsed.audit_logs = [];
    return parsed;
  } catch (err) {
    console.error('ensureDataFile error:', err);
    return {
      categories: INITIAL_CATEGORIES,
      products: INITIAL_PRODUCTS,
      orders: [],
      payments: [],
      invoices: [],
      addresses: [],
      payment_methods: INITIAL_PAYMENT_METHODS,
      users: [],
      store_config: DEFAULT_STORE_CONFIG,
      audit_logs: [],
    };
  }
}

function saveStore(store: SchemaStore): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2), 'utf8');
  } catch (err) {
    console.error('saveStore error:', err);
  }
}

export const persistentStore = {
  getCategories(): Category[] {
    const store = ensureDataFile();
    return store.categories.filter((c) => c.is_active !== false);
  },

  createCategory(category: Category): Category {
    const store = ensureDataFile();
    store.categories.unshift(category);
    saveStore(store);
    return category;
  },

  getProducts(): Product[] {
    const store = ensureDataFile();
    // Attach category object to products
    const catsMap = new Map(store.categories.map((c) => [c.id, c]));
    return store.products.map((p) => ({
      ...p,
      category: catsMap.get(p.category_id),
    }));
  },

  getProductById(id: string): Product | null {
    const products = this.getProducts();
    return products.find((p) => p.id === id) || null;
  },

  getProductBySlug(slug: string): Product | null {
    const products = this.getProducts();
    return products.find((p) => p.slug === slug) || null;
  },

  createProduct(product: Product): Product {
    const store = ensureDataFile();
    store.products.unshift(product);
    saveStore(store);
    return product;
  },

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const store = ensureDataFile();
    const idx = store.products.findIndex((p) => p.id === id);
    if (idx < 0) return null;
    store.products[idx] = {
      ...store.products[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    saveStore(store);
    return store.products[idx];
  },

  deleteProduct(id: string): boolean {
    const store = ensureDataFile();
    store.products = store.products.filter((p) => p.id !== id);
    saveStore(store);
    return true;
  },

  updateProductStock(id: string, newQty: number): Product | null {
    return this.updateProduct(id, { stock_quantity: newQty });
  },

  getAddresses(userId?: string): Address[] {
    const store = ensureDataFile();
    if (userId) {
      return store.addresses.filter((a) => a.user_id === userId);
    }
    return [];
  },

  getAddressById(id: string, userId?: string): Address | null {
    const store = ensureDataFile();
    const addr = store.addresses.find((a) => a.id === id);
    if (!addr) return null;
    if (userId && addr.user_id !== userId) return null;
    return addr;
  },

  createAddress(address: Address): Address {
    const store = ensureDataFile();
    store.addresses.unshift(address);
    saveStore(store);
    return address;
  },

  getOrders(userId?: string): Order[] {
    const store = ensureDataFile();
    let res = store.orders;
    if (userId) {
      res = res.filter((o) => o.user_id === userId);
    }
    return res.sort((a, b) => new Date(b.placed_at || 0).getTime() - new Date(a.placed_at || 0).getTime());
  },

  getOrderById(id: string): Order | null {
    const store = ensureDataFile();
    return store.orders.find((o) => o.id === id || o.order_number === id) || null;
  },

  createOrder(order: Order): Order {
    const store = ensureDataFile();
    store.orders.unshift(order);
    saveStore(store);
    return order;
  },

  updateOrder(id: string, updates: Partial<Order>): Order | null {
    const store = ensureDataFile();
    const idx = store.orders.findIndex((o) => o.id === id || o.order_number === id);
    if (idx < 0) return null;
    store.orders[idx] = {
      ...store.orders[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    saveStore(store);
    return store.orders[idx];
  },

  getPayments(): Payment[] {
    const store = ensureDataFile();
    return store.payments;
  },

  createPayment(payment: Payment): Payment {
    const store = ensureDataFile();
    store.payments.unshift(payment);
    saveStore(store);
    return payment;
  },

  updatePayment(id: string, updates: Partial<Payment>): Payment | null {
    const store = ensureDataFile();
    const idx = store.payments.findIndex((p) => p.id === id || p.order_id === id);
    if (idx < 0) return null;
    store.payments[idx] = {
      ...store.payments[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    saveStore(store);
    return store.payments[idx];
  },

  getInvoices(userId?: string): Invoice[] {
    const store = ensureDataFile();
    let res = store.invoices;
    if (userId) {
      res = res.filter((inv) => inv.order?.user_id === userId);
    }
    return res;
  },

  createInvoice(invoice: Invoice): Invoice {
    const store = ensureDataFile();
    store.invoices.unshift(invoice);
    saveStore(store);
    return invoice;
  },

  getPaymentMethods(): PaymentMethod[] {
    const store = ensureDataFile();
    return store.payment_methods;
  },

  createPaymentMethod(pm: PaymentMethod): PaymentMethod {
    const store = ensureDataFile();
    store.payment_methods.push(pm);
    saveStore(store);
    return pm;
  },

  togglePaymentMethod(id: string, is_active: boolean): boolean {
    const store = ensureDataFile();
    const idx = store.payment_methods.findIndex((m) => m.id === id);
    if (idx >= 0) {
      store.payment_methods[idx].is_active = is_active;
      saveStore(store);
      return true;
    }
    return false;
  },

  deletePaymentMethod(id: string): boolean {
    const store = ensureDataFile();
    store.payment_methods = store.payment_methods.filter((m) => m.id !== id);
    saveStore(store);
    return true;
  },

  getStoreConfig(): StoreConfig {
    const store = ensureDataFile();
    return store.store_config || DEFAULT_STORE_CONFIG;
  },

  updateStoreConfig(updates: Partial<StoreConfig>): StoreConfig {
    const store = ensureDataFile();
    const current = store.store_config || DEFAULT_STORE_CONFIG;
    store.store_config = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    saveStore(store);
    return store.store_config;
  },

  getAuditLogs(): AdminAuditLog[] {
    const store = ensureDataFile();
    return (store.audit_logs || []).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  createAuditLog(log: AdminAuditLog): AdminAuditLog {
    const store = ensureDataFile();
    if (!store.audit_logs) store.audit_logs = [];
    store.audit_logs.unshift(log);
    saveStore(store);
    return log;
  },
};
