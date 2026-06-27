-- =============================================
-- BarkedShop Database Schema
-- Platform: PostgreSQL (Neon compatible)
-- =============================================

-- USERS
CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    role        VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(80) NOT NULL,
    slug        VARCHAR(80) UNIQUE NOT NULL,
    parent_id   INT DEFAULT NULL REFERENCES categories(id)
);

-- PRODUCTS
CREATE TABLE IF NOT EXISTS products (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    price           DECIMAL(10,2) NOT NULL,
    original_price  DECIMAL(10,2),
    stock           INT DEFAULT 0,
    category_id     INT REFERENCES categories(id),
    image_url       VARCHAR(500),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PRODUCT SIZES
CREATE TABLE IF NOT EXISTS product_sizes (
    id          SERIAL PRIMARY KEY,
    product_id  INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    size        VARCHAR(10) NOT NULL,
    stock       INT DEFAULT 0
);

-- ORDERS
CREATE TABLE IF NOT EXISTS orders (
    id              SERIAL PRIMARY KEY,
    user_id         INT REFERENCES users(id),
    total           DECIMAL(10,2) NOT NULL DEFAULT 0,
    status          VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','processing','shipped','delivered','cancelled')),
    shipping_addr   TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
    id          SERIAL PRIMARY KEY,
    order_id    INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id  INT NOT NULL REFERENCES products(id),
    quantity    INT NOT NULL,
    unit_price  DECIMAL(10,2) NOT NULL,
    size        VARCHAR(10)
);

-- CART
CREATE TABLE IF NOT EXISTS cart_items (
    id          SERIAL PRIMARY KEY,
    user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id  INT NOT NULL REFERENCES products(id),
    quantity    INT DEFAULT 1,
    size        VARCHAR(10),
    added_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
    id          SERIAL PRIMARY KEY,
    product_id  INT NOT NULL REFERENCES products(id),
    user_id     INT NOT NULL REFERENCES users(id),
    rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment     TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- WISHLIST
CREATE TABLE IF NOT EXISTS wishlist (
    id          SERIAL PRIMARY KEY,
    user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id  INT NOT NULL REFERENCES products(id),
    added_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, product_id)
);

-- NEWSLETTER
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id          SERIAL PRIMARY KEY,
    email       VARCHAR(150) UNIQUE NOT NULL,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ANALYTICS
CREATE TABLE IF NOT EXISTS analytics (
    id                    SERIAL PRIMARY KEY,
    session_id            VARCHAR(50),
    timestamp             TIMESTAMP,
    duration_seconds      INT,
    pages_count           INT,
    search_queries_count  INT,

    -- Identidad de usuario (P3)
    user_id               VARCHAR(80),
    session_count         INT DEFAULT 1,
    first_visit           TIMESTAMP,
    is_returning_user     BOOLEAN DEFAULT FALSE,

    -- Categorías exploradas (P1)
    categories_count      INT DEFAULT 0,
    categories_list       JSONB DEFAULT '[]',

    -- Favoritos y tiempos por producto (P2)
    favorites_added_count INT DEFAULT 0,
    favorites_added_list  JSONB DEFAULT '[]',
    products_viewed_json  JSONB DEFAULT '{}',

    -- Búsqueda (P5)
    used_search           VARCHAR(5) DEFAULT 'No',

    -- Clics generales (P6)
    clicks_total          INT DEFAULT 0,
    clicks_favorite       INT DEFAULT 0,
    clicks_add_to_cart    INT DEFAULT 0,
    clicks_search         INT DEFAULT 0,
    clicks_navigation     INT DEFAULT 0,

    -- Promociones (P4)
    promo_clicks_count       INT DEFAULT 0,
    promo_clicks_list        JSONB DEFAULT '[]',
    cart_after_promo_count   INT DEFAULT 0,
    cart_after_promo_list    JSONB DEFAULT '[]',
    search_after_promo_count INT DEFAULT 0,

    created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Categories
INSERT INTO categories (name, slug) VALUES
  ('Women',  'women'),
  ('Men',    'men'),
  ('New In', 'new-in'),
  ('Sale',   'sale')
ON CONFLICT (slug) DO NOTHING;
