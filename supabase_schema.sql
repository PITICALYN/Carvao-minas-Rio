-- Script de Instalação Simplificado
-- Copie TODO o texto abaixo e cole no SQL Editor do Supabase de uma só vez.

CREATE TABLE IF NOT EXISTS price_tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    prices JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    contact TEXT,
    document TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    license_plate TEXT,
    vehicle_model TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    document TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    credit_limit DECIMAL(12, 2) DEFAULT 0,
    payment_terms TEXT,
    price_table_id UUID REFERENCES price_tables(id) ON DELETE SET NULL,
    is_blocked BOOLEAN DEFAULT FALSE,
    blocked_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users_table (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('Admin', 'Factory', 'Itaguai', 'Production', 'Seller', 'Financial', 'Director')),
    permissions JSONB NOT NULL,
    can_print BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS production_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    input_weight_kg DECIMAL(10, 2) NOT NULL,
    inputs JSONB NOT NULL,
    outputs JSONB NOT NULL,
    total_output_weight_kg DECIMAL(10, 2) NOT NULL,
    loss_percentage DECIMAL(5, 2) NOT NULL,
    timestamp BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    location TEXT NOT NULL,
    customer_name TEXT,
    items JSONB NOT NULL,
    total_amount DECIMAL(12, 2) NOT NULL,
    payment_method TEXT NOT NULL,
    payment_term INTEGER,
    due_date DATE,
    timestamp BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory (
    location TEXT PRIMARY KEY,
    stock JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    due_date DATE NOT NULL,
    type TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    amount DECIMAL(12, 2) NOT NULL,
    status TEXT NOT NULL,
    entity_id UUID,
    entity_name TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    status TEXT NOT NULL,
    items JSONB NOT NULL,
    total_amount DECIMAL(12, 2) NOT NULL,
    manifest_number TEXT,
    origin_authorization_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,
    date DATE NOT NULL,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    sales_ids UUID[],
    source_location TEXT,
    destination_location TEXT,
    items JSONB,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp BIGINT NOT NULL,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    entity_id TEXT,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO app_settings (key, value) VALUES ('branding', '{"logoUrl": "/logo.jpg", "title": "Minas Rio - Gestão de Carvão"}') ON CONFLICT (key) DO NOTHING;
INSERT INTO inventory (location, stock) VALUES ('Factory', '{"3kg": 0, "5kg": 0, "Paulistao": 0, "Bulk": 0}'), ('Itaguai', '{"3kg": 0, "5kg": 0, "Paul1stao": 0, "Bulk": 0}') ON CONFLICT (location) DO NOTHING;
INSERT INTO users_table (id, name, username, password, role, permissions, can_print) VALUES ('admin', 'Administrador', 'admin', '124', 'Admin', '["view_dashboard", "view_sales", "manage_sales", "view_production", "manage_production", "view_inventory", "manage_inventory", "view_financial", "manage_financial", "view_commercial", "manage_commercial", "manage_prices", "view_users", "manage_users", "view_reports", "manage_settings", "view_audit"]'::jsonb, TRUE) ON CONFLICT (id) DO NOTHING;
