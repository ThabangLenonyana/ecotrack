-- Create waste categories table with relationships
CREATE TABLE IF NOT EXISTS waste_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(510),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_category_name UNIQUE (name)
);

-- Create disposal guidelines table with relationship to waste_categories
CREATE TABLE IF NOT EXISTS disposal_guidelines (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    instructions TEXT NOT NULL,
    category_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES waste_categories(id) ON DELETE SET NULL,
    CONSTRAINT uk_guideline_title UNIQUE (title)
);

-- Create recycling tips table with relationship to waste_categories
CREATE TABLE IF NOT EXISTS recycling_tips (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    category_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES waste_categories(id) ON DELETE SET NULL,
    CONSTRAINT uk_tip_title UNIQUE (title)
);

-- Create indexes for better query performance
CREATE INDEX idx_category_name ON waste_categories(name);
CREATE INDEX idx_guideline_category ON disposal_guidelines(category_id);
CREATE INDEX idx_tip_category ON recycling_tips(category_id);