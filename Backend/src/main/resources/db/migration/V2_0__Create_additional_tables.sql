-- Create customers table (leady_stolarze)
CREATE TABLE IF NOT EXISTS leady_stolarze (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    contact_info TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    quantity_in_stock DECIMAL(10,2) DEFAULT 0,
    price_per_kg DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES leady_stolarze(id),
    salesman_id UUID REFERENCES profiles(id),
    status TEXT DEFAULT 'NEW',
    total_amount DECIMAL(10,2) DEFAULT 0,
    total_weight DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id),
    product_id UUID REFERENCES products(id),
    quantity DECIMAL(10,2),
    price_per_unit DECIMAL(10,2),
    total_price DECIMAL(10,2),
    weight DECIMAL(10,2)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_leady_stolarze_created_at ON leady_stolarze(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_salesman_id ON orders(salesman_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Insert sample data
INSERT INTO leady_stolarze (name, contact_info, address, phone, email) VALUES
('Jan Kowalski', 'Kontakt: email', 'Warszawa, ul. Główna 1', '123-456-789', 'jan.kowalski@example.com'),
('Anna Nowak', 'Kontakt: telefon', 'Kraków, ul. Krakowska 2', '987-654-321', 'anna.nowak@example.com')
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, quantity_in_stock, price_per_kg) VALUES
('Drewno sosnowe', 'Wysokiej jakości drewno sosnowe', 100.50, 5.00),
('Drewno dębowe', 'Trwałe drewno dębowe', 75.25, 10.00)
ON CONFLICT DO NOTHING;