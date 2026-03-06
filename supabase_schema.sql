-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Suppliers
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    contact TEXT,
    document TEXT, -- CPF/CNPJ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Customers
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    document TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    credit_limit DECIMAL(12, 2) DEFAULT 0,
    payment_terms TEXT,
    price_table_id UUID REFERENCES price_tables(id),
    is_blocked BOOLEAN DEFAULT FALSE,
    blocked_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Price Tables
CREATE TABLE IF NOT EXISTS price_tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    prices JSONB NOT NULL, -- Record<ProductType, number>
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key to customers
ALTER TABLE customers ADD CONSTRAINT fk_price_table FOREIGN KEY (price_table_id) REFERENCES price_tables(id) ON DELETE SET NULL;

-- 4. Production Batches
CREATE TABLE IF NOT EXISTS production_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    input_weight_kg DECIMAL(10, 2) NOT NULL,
    inputs JSONB NOT NULL, -- Array of BatchInput
    outputs JSONB NOT NULL, -- Array of {productType, quantity}
    total_output_weight_kg DECIMAL(10, 2) NOT NULL,
    loss_percentage DECIMAL(5, 2) NOT NULL,
    timestamp BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Sales
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    location TEXT NOT NULL, -- 'Factory' | 'Itaguai'
    customer_name TEXT,
    items JSONB NOT NULL, -- Array of SaleItem
    total_amount DECIMAL(12, 2) NOT NULL,
    payment_method TEXT NOT NULL, -- 'Cash' | 'Credit'
    payment_term INTEGER, -- Days
    due_date DATE,
    timestamp BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Financial Transactions
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    due_date DATE NOT NULL,
    type TEXT NOT NULL, -- 'Income' | 'Expense'
    category TEXT NOT NULL, -- 'Sales' | 'Purchase' | etc
    description TEXT,
    amount DECIMAL(12, 2) NOT NULL,
    status TEXT NOT NULL, -- 'Pending' | 'Paid' | 'Overdue'
    entity_id UUID, -- Customer or Supplier ID
    entity_name TEXT,
    location TEXT, -- 'Factory' | 'Itaguai'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Purchase Orders
CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES suppliers(id),
    date DATE NOT NULL,
    status TEXT NOT NULL, -- 'Pending' | 'Approved' | 'Received' | 'Cancelled'
    items JSONB NOT NULL, -- Array of items
    total_amount DECIMAL(12, 2) NOT NULL,
    manifest_number TEXT,
    origin_authorization_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Drivers
CREATE TABLE IF NOT EXISTS drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    license_plate TEXT,
    vehicle_model TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Shipments
CREATE TABLE IF NOT EXISTS shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL, -- 'Sale' | 'Transfer'
    date DATE NOT NULL,
    driver_id UUID REFERENCES drivers(id),
    sales_ids UUID[], -- Array of sale IDs
    source_location TEXT,
    destination_location TEXT,
    items JSONB, -- For transfers
    status TEXT NOT NULL, -- 'Planned' | 'InTransit' | 'Delivered'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp BIGINT NOT NULL,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    entity_id TEXT,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Inventory (Current state)
CREATE TABLE IF NOT EXISTS inventory (
    location TEXT PRIMARY KEY, -- 'Factory', 'Itaguai'
    stock JSONB NOT NULL -- { '3kg': 0, '5kg': 0, ... }
);

-- Initial Inventory Data
INSERT INTO inventory (location, stock) VALUES 
('Factory', '{"3kg": 0, "5kg": 0, "Paulistao": 0, "Bulk": 0}'),
('Itaguai', '{"3kg": 0, "5kg": 0, "Paulistao": 0, "Bulk": 0}')
ON CONFLICT (location) DO NOTHING;
-- 12. Users Control
CREATE TABLE IF NOT EXISTS users_table (
    id TEXT PRIMARY KEY, -- Using TEXT to support both UUIDs and 'admin' id
    name TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('Admin', 'Factory', 'Itaguai', 'Production', 'Seller', 'Financial', 'Director')),
    permissions JSONB NOT NULL,
    can_print BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Initial Admin User
INSERT INTO users_table (id, name, username, password, role, permissions, can_print) VALUES 
('admin', 'Administrador', 'admin', '123', 'Admin', '["view_dashboard", "view_sales", "manage_sales", "view_production", "manage_production", "view_inventory", "manage_inventory", "view_financial", "manage_financial", "view_commercial", "manage_commercial", "manage_prices", "view_users", "manage_users", "view_reports", "manage_settings", "view_audit"]', TRUE)
ON CONFLICT (id) DO NOTHING;
