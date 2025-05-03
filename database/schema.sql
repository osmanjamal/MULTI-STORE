-- مخطط قاعدة البيانات لنظام مزامنة المتاجر المتعددة
-- تنفيذ مباشر لنموذج البيانات الخاص بالتطبيق

-- حذف الجداول إذا كانت موجودة
DROP TABLE IF EXISTS sync_logs;
DROP TABLE IF EXISTS webhooks;
DROP TABLE IF EXISTS sync_rules;
DROP TABLE IF EXISTS fulfillments;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS inventories;
DROP TABLE IF EXISTS product_variants;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS connections;
DROP TABLE IF EXISTS stores;
DROP TABLE IF EXISTS user_settings;
DROP TABLE IF EXISTS users;

-- إنشاء جدول المستخدمين
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'user',
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- إنشاء جدول إعدادات المستخدمين
CREATE TABLE user_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    language VARCHAR(10) DEFAULT 'ar',
    timezone VARCHAR(50) DEFAULT 'Asia/Riyadh',
    notification_email BOOLEAN DEFAULT TRUE,
    notification_sync_errors BOOLEAN DEFAULT TRUE,
    notification_low_stock BOOLEAN DEFAULT FALSE,
    notification_new_orders BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- إنشاء جدول المتاجر
CREATE TABLE stores (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL, -- shopify, lazada, shopee, woocommerce
    url TEXT NOT NULL,
    api_key VARCHAR(255) NOT NULL,
    api_secret VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active',
    settings JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_sync TIMESTAMP
);

-- إنشاء جدول الاتصالات بين المتاجر
CREATE TABLE connections (
    id SERIAL PRIMARY KEY,
    source_store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
    target_store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(source_store_id, target_store_id)
);

-- إنشاء جدول المنتجات
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
    external_id VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100),
    barcode VARCHAR(100),
    category VARCHAR(100),
    images JSONB,
    price DECIMAL(10, 2) NOT NULL,
    compare_at_price DECIMAL(10, 2),
    cost DECIMAL(10, 2),
    weight DECIMAL(10, 2),
    weight_unit VARCHAR(10),
    vendor VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active',
    attributes JSONB,
    tags JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- إنشاء جدول متغيرات المنتج
CREATE TABLE product_variants (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    external_id VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100),
    barcode VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL,
    compare_at_price DECIMAL(10, 2),
    cost DECIMAL(10, 2),
    weight DECIMAL(10, 2),
    weight_unit VARCHAR(10),
    inventory INTEGER DEFAULT 0,
    options JSONB,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- إنشاء جدول المخزون
CREATE TABLE inventories (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    variant_id INTEGER REFERENCES product_variants(id) ON DELETE SET NULL,
    store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 0,
    stock_status VARCHAR(20) DEFAULT 'in_stock',
    low_stock_threshold INTEGER DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- إنشاء جدول الطلبات
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
    external_id VARCHAR(255),
    order_number VARCHAR(100) NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(100),
    customer_phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'pending',
    currency VARCHAR(10) DEFAULT 'SAR',
    subtotal_amount DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    shipping_amount DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    shipping_address JSONB,
    billing_address JSONB,
    payment_method VARCHAR(50),
    payment_status VARCHAR(20),
    notes TEXT,
    status_history JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- إنشاء جدول عناصر الطلب
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    variant_id INTEGER REFERENCES product_variants(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100),
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- إنشاء جدول إتمام الطلبات
CREATE TABLE fulfillments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    tracking_number VARCHAR(100),
    tracking_url TEXT,
    carrier VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending',
    items JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- إنشاء جدول قواعد المزامنة
CREATE TABLE sync_rules (
    id SERIAL PRIMARY KEY,
    source_store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
    target_store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
    sync_type VARCHAR(20) NOT NULL, -- inventory, products, prices, orders
    mode VARCHAR(20) DEFAULT 'one-way', -- one-way, two-way
    interval INTEGER DEFAULT 60, -- بالدقائق
    status VARCHAR(20) DEFAULT 'active',
    filters JSONB,
    last_sync TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- إنشاء جدول Webhooks
CREATE TABLE webhooks (
    id SERIAL PRIMARY KEY,
    store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    url TEXT NOT NULL,
    topic VARCHAR(50) NOT NULL,
    format VARCHAR(20) DEFAULT 'json',
    secret VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- إنشاء جدول سجلات المزامنة
CREATE TABLE sync_logs (
    id SERIAL PRIMARY KEY,
    store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
    sync_rule_id INTEGER REFERENCES sync_rules(id) ON DELETE SET NULL,
    sync_type VARCHAR(20) NOT NULL,
    entity_type VARCHAR(20), -- product, inventory, order
    entity_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending',
    message TEXT,
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- إنشاء الفهارس
CREATE INDEX idx_product_store ON products(store_id);
CREATE INDEX idx_product_sku ON products(sku);
CREATE INDEX idx_product_status ON products(status);
CREATE INDEX idx_variant_product ON product_variants(product_id);
CREATE INDEX idx_inventory_product ON inventories(product_id);
CREATE INDEX idx_inventory_store ON inventories(store_id);
CREATE INDEX idx_order_store ON orders(store_id);
CREATE INDEX idx_order_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_sync_rules_source ON sync_rules(source_store_id);
CREATE INDEX idx_sync_rules_target ON sync_rules(target_store_id);
CREATE INDEX idx_sync_logs_store ON sync_logs(store_id);
CREATE INDEX idx_sync_logs_rule ON sync_logs(sync_rule_id);
CREATE INDEX idx_sync_logs_status ON sync_logs(status);