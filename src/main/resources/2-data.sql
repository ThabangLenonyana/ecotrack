-- Insert waste categories
INSERT INTO waste_categories (name, description, created_at, updated_at) VALUES
    ('Plastic', 'Various plastic materials including bottles, containers, and packaging', CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('Paper', 'Paper products including cardboard, newspapers, and magazines', CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('Glass', 'Glass bottles, jars, and containers', CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('Electronic', 'Electronic devices, batteries, and components', CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('Metal', 'Metal items, cans, and aluminum products', CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('Organic', 'Food waste, garden waste, and biodegradable materials', CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('Construction', 'Building materials and construction debris', CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('Medical', 'Healthcare-related waste and medical supplies', CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('Battery', 'All types of batteries and related components', CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());

-- Insert disposal guidelines with proper category references
INSERT INTO disposal_guidelines (title, instructions, category_id, created_at, updated_at) VALUES
    ('Plastic Bottle Disposal', 'Empty, rinse, and crush plastic bottles before placing in recycling bin', 
        (SELECT id FROM waste_categories WHERE name = 'Plastic'), CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('Paper Recycling Guide', 'Keep paper dry and separate from other materials. Remove any plastic coverings', 
        (SELECT id FROM waste_categories WHERE name = 'Paper'), CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('Glass Container Handling', 'Rinse glass containers and remove lids. Sort by color if required', 
        (SELECT id FROM waste_categories WHERE name = 'Glass'), CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('E-Waste Disposal Protocol', 'Never dispose of electronics in regular trash. Take to designated e-waste centers', 
        (SELECT id FROM waste_categories WHERE name = 'Electronic'), CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('Composting Guidelines', 'Collect kitchen scraps and yard waste. Maintain proper moisture and aeration', 
        (SELECT id FROM waste_categories WHERE name = 'Organic'), CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('General Recycling Rules', 'Clean items before recycling. Remove non-recyclable components.', NULL, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('Hazardous Waste Handling', 'Store separately and dispose at designated facilities only', NULL, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('Construction Waste Sorting', 'Separate materials into: wood, metal, concrete, and hazardous materials. Contact specialized construction waste handlers.', 
        (SELECT id FROM waste_categories WHERE name = 'Construction'), CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('Medical Waste Protocol', 'Use designated red bags. Keep sharps in approved containers. Contact licensed medical waste disposal service.', 
        (SELECT id FROM waste_categories WHERE name = 'Medical'), CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('Safe Battery Disposal', 'Never dispose of batteries in regular trash. Use designated battery recycling points or electronic stores.', 
        (SELECT id FROM waste_categories WHERE name = 'Battery'), CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('Concrete Recycling', 'Clean concrete can be crushed and reused as aggregate. Contact local recycling facilities.', 
        (SELECT id FROM waste_categories WHERE name = 'Construction'), CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('Medical PPE Disposal', 'Dispose of used PPE in designated medical waste bins. Never reuse disposable items.', 
        (SELECT id FROM waste_categories WHERE name = 'Medical'), CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());

-- Insert recycling tips with proper category references
INSERT INTO recycling_tips (title, content, category_id, created_at, updated_at) VALUES
    ('Plastic Recycling Symbols', 'Check the recycling symbol on plastic items. Numbers 1 and 2 are most widely recyclable', 
        (SELECT id FROM waste_categories WHERE name = 'Plastic'), CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('Paper Saving Tips', 'Print double-sided when possible. Reuse paper for notes before recycling', 
        (SELECT id FROM waste_categories WHERE name = 'Paper'), CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('Glass Recycling Benefits', 'Glass is 100% recyclable and can be recycled endlessly without loss in quality', 
        (SELECT id FROM waste_categories WHERE name = 'Glass'), CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('Battery Recycling', 'Use rechargeable batteries when possible. Never dispose of batteries in regular trash', 
        (SELECT id FROM waste_categories WHERE name = 'Battery'), CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('Metal Can Preparation', 'Rinse cans, remove labels when possible, and crush to save space', 
        (SELECT id FROM waste_categories WHERE name = 'Metal'), CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('Home Composting Success', 'Layer green and brown materials. Turn compost regularly for faster decomposition', 
        (SELECT id FROM waste_categories WHERE name = 'Organic'), CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('General Waste Reduction', 'Reduce consumption, reuse items when possible, and recycle as a last resort', 
        (SELECT id FROM waste_categories WHERE name = 'Medical'), CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('Sustainable Living Tips', 'Small changes in daily habits can make a big difference in waste reduction', 
        (SELECT id FROM waste_categories WHERE name = 'Glass'), CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('Battery Recycling Benefits', 'Recycling batteries prevents harmful chemicals from entering landfills and allows recovery of valuable metals.', 
        (SELECT id FROM waste_categories WHERE name = 'Battery'), CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('Construction Material Reuse', 'Many construction materials can be reused or donated to local building material reuse centers.', 
        (SELECT id FROM waste_categories WHERE name = 'Construction'), CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());
