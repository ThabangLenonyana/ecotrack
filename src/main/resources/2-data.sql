-- Insert waste categories
INSERT INTO waste_categories (name, description, created_at, updated_at) VALUES
    ('Plastic', 'Various plastic materials including bottles, containers, and packaging', CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('Paper', 'Paper products including cardboard, newspapers, and magazines', CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('Glass', 'Glass bottles, jars, and containers', CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('Electronic', 'Electronic devices, batteries, and components', CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('Metal', 'Metal items, cans, and aluminum products', CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('Organic', 'Food waste, garden waste, and biodegradable materials', CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());

-- Insert disposal guidelines
INSERT INTO disposal_guidelines (title, instructions, category_id, created_at, updated_at) VALUES
    ('Plastic Bottle Disposal', 'Empty, rinse, and crush plastic bottles before placing in recycling bin', 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('Paper Recycling Guide', 'Keep paper dry and separate from other materials. Remove any plastic coverings', 2, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('Glass Container Handling', 'Rinse glass containers and remove lids. Sort by color if required', 3, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('E-Waste Disposal Protocol', 'Never dispose of electronics in regular trash. Take to designated e-waste centers', 4, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('Composting Guidelines', 'Collect kitchen scraps and yard waste. Maintain proper moisture and aeration', 6, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('General Recycling Rules', 'Clean items before recycling. Remove non-recyclable components.', NULL, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('Hazardous Waste Handling', 'Store separately and dispose at designated facilities only', NULL, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());

-- Insert recycling tips
INSERT INTO recycling_tips (title, content, category_id, created_at, updated_at) VALUES
    ('Plastic Recycling Symbols', 'Check the recycling symbol on plastic items. Numbers 1 and 2 are most widely recyclable', 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('Paper Saving Tips', 'Print double-sided when possible. Reuse paper for notes before recycling', 2, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('Glass Recycling Benefits', 'Glass is 100% recyclable and can be recycled endlessly without loss in quality', 3, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('Battery Recycling', 'Use rechargeable batteries when possible. Never dispose of batteries in regular trash', 4, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('Metal Can Preparation', 'Rinse cans, remove labels when possible, and crush to save space', 5, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('Home Composting Success', 'Layer green and brown materials. Turn compost regularly for faster decomposition', 6, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('General Waste Reduction', 'Reduce consumption, reuse items when possible, and recycle as a last resort', NULL, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('Sustainable Living Tips', 'Small changes in daily habits can make a big difference in waste reduction', NULL, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());