
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
    title VARCHAR(100) NOT NULL UNIQUE,
    steps TEXT NOT NULL,
    difficulty VARCHAR(10) NOT NULL,
    environmental_impact TEXT,
    time_required VARCHAR(50) NOT NULL,
    required_materials TEXT,
    category_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES waste_categories(id) ON DELETE SET NULL,
    CONSTRAINT uk_tip_title UNIQUE (title)
);

-- Create recycling locations table
/*CREATE TABLE IF NOT EXISTS recycling_locations (
    id BIGINT PRIMARY KEY,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    name VARCHAR(150) NOT NULL,
    municipality VARCHAR(100),
    main_place VARCHAR(100),
    type VARCHAR(50),
    operation VARCHAR(100),
    group_name VARCHAR(50),
    website VARCHAR(255),
    other TEXT,
    accepts_cans BOOLEAN,
    accepts_cardboard BOOLEAN,
    accepts_cartons BOOLEAN,
    is_dropoff_site BOOLEAN,
    accepts_ewaste BOOLEAN,
    accepts_metal BOOLEAN,
    accepts_motor_oil BOOLEAN,
    is_paid BOOLEAN,
    accepts_paper BOOLEAN,
    accepts_plastic BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);*/


-- Create indexes for better query performance
CREATE INDEX idx_category_name ON waste_categories(name);
CREATE INDEX idx_guideline_category ON disposal_guidelines(category_id);
CREATE INDEX idx_tip_category ON recycling_tips(category_id);
--CREATE INDEX idx_location_coords ON recycling_locations(latitude, longitude);
--CREATE INDEX idx_location_type ON recycling_locations(type);