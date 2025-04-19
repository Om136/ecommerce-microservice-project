-- Product service database initialization
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- Insert default categories
INSERT INTO categories (name) VALUES ('Pan') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO categories (name) VALUES ('Pot') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO categories (name) VALUES ('Vacuum Cleaner') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO categories (name) VALUES ('Stove') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO categories (name) VALUES ('Blender') ON DUPLICATE KEY UPDATE name=name;

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price FLOAT NOT NULL,
    image VARCHAR(255),
    description TEXT,
    category_id INT,
    quantity INT DEFAULT 0,
    active TINYINT,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);