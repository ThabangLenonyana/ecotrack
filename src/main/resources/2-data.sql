-- Insert waste categories with improved descriptions
INSERT INTO waste_categories (name, description, created_at, updated_at) VALUES
    ('Plastic', 'Includes single-use and reusable plastic items such as PET bottles, HDPE containers, plastic bags, packaging materials, and synthetic fabric items. Requires careful sorting by plastic type for effective recycling.', CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('Paper', 'Encompasses all paper-based products including office paper, newspapers, magazines, cardboard boxes, paper bags, and packaging materials. Clean and dry items are ideal for recycling.', CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('Glass', 'Clear, green, and brown glass containers, bottles, jars, and broken glass items. Must be separated by color for recycling. Excludes window glass, mirrors, and ceramics.', CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('Electronic', 'Includes computers, smartphones, tablets, TVs, printers, and other electronic devices. Contains valuable recoverable materials but also hazardous components requiring special handling.', CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('Metal', 'Ferrous and non-ferrous metals including steel cans, aluminum containers, scrap metal, wire, and appliances. Highly recyclable materials that can be processed indefinitely.', CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('Organic', 'Biodegradable materials including food scraps, yard waste, wood, and natural fibers. Can be composted to create nutrient-rich soil amendments.', CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('Construction', 'Building and renovation waste including concrete, wood, metals, drywall, and insulation materials. Many components can be recycled or repurposed.', CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('Medical', 'Healthcare-related items including sharps, medications, bandages, and contaminated materials. Requires specialized handling and disposal methods to prevent health risks.', CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('Battery', 'Both single-use and rechargeable batteries of all sizes and types. Contains hazardous materials requiring proper disposal through authorized recycling programs.', CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());

-- Insert disposal guidelines
INSERT INTO disposal_guidelines (title, instructions, category_id, created_at, updated_at) VALUES
    ('Plastic Bottle Recycling', 'Remove caps, rinse thoroughly, crush to save space, check bottom for recycling number, place in designated recycling bin.', 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('Paper Sorting Guide', 'Keep paper clean and dry, remove plastic wrapping, separate by type (newspaper, cardboard, office paper), flatten boxes.', 2, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('Safe Glass Disposal', 'Rinse containers, remove metal caps and cork, sort by color, wrap broken glass in paper before disposal.', 3, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('E-Waste Handling', 'Back up and wipe data, remove batteries, package securely, deliver to certified e-waste recycling center.', 4, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('Metal Can Preparation', 'Clean thoroughly, remove labels when possible, crush to save space, check for local recycling requirements.', 5, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('Composting Basics', 'Layer green and brown materials, maintain moisture, turn regularly, monitor temperature, avoid meat and dairy.', 6, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('Construction Waste Sorting', 'Separate materials by type, remove hazardous materials, arrange proper disposal through certified handlers.', 7, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('Medical Waste Protocol', 'Use approved containers, seal properly, label clearly, arrange collection by authorized medical waste handlers.', 8, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    ('Battery Recycling Steps', 'Sort by type, tape terminal ends, store in dry place, deliver to authorized collection points.', 9, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());

-- Insert recycling tips with proper JSON array steps
INSERT INTO recycling_tips (title, steps, difficulty, environmental_impact, time_required, required_materials, category_id, created_at, updated_at) VALUES
    ('DIY Plastic Bottle Planters', 
     '["Clean bottle thoroughly", "Cut bottle horizontally", "Drill drainage holes", "Add soil and plants"]',
     'Easy', 
     'Reduces plastic waste and promotes urban gardening',
     '15 minutes',
     'Plastic bottle, scissors, drill, soil, plants',
     1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    
    ('Cardboard Composting',
     '["Remove tape and staples", "Shred or tear into small pieces", "Mix with green materials", "Add to compost bin"]',
     'Easy',
     'Creates nutrient-rich soil and reduces landfill waste',
     '20 minutes',
     'Cardboard, scissors, compost bin',
     2, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    
    ('Glass Jar Upcycling',
     '["Clean thoroughly", "Remove labels", "Sanitize in boiling water", "Decorate as needed"]',
     'Medium',
     'Reduces glass waste and eliminates need for new containers',
     '30 minutes',
     'Glass jars, scraper, boiling water, decorative materials',
     3, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    
    ('Electronics Repair Guide',
     '["Identify issue", "Research repair options", "Gather tools", "Follow repair guides"]',
     'Hard',
     'Extends device lifespan and reduces e-waste',
     '1-3 hours',
     'Screwdrivers, spudger, repair manual',
     4, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
    
    ('Metal Can Art Project',
     '["Clean cans", "Sand edges", "Paint base coat", "Create design"]',
     'Medium',
     'Reduces metal waste through creative reuse',
     '45 minutes',
     'Clean cans, sandpaper, paint, brushes',
     5, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());

MERGE INTO recycling_locations (
    id, latitude, longitude, name, municipality, city, type, operation,
    group_name, website, other, accepts_cans, accepts_cardboard, accepts_cartons,
    is_dropoff_site, accepts_ewaste, accepts_metal, accepts_motor_oil,
    is_paid, accepts_paper, accepts_plastic, created_at, updated_at
)
SELECT 
    CAST(ID AS BIGINT),
    CAST(LATITUDE AS DOUBLE),  
    CAST(LONGITUDE AS DOUBLE),
    NAME,
    MUNICIPALITY,
    CITY,
    TYPE,
    OPERATION,
    GROUP_NAME,
    WEBSITE,
    OTHER,
    CASE WHEN CAN_TIN = 'y' THEN TRUE WHEN CAN_TIN = 'n' THEN FALSE ELSE NULL END,
    CASE WHEN CARD = 'y' THEN TRUE WHEN CARD = 'n' THEN FALSE ELSE NULL END,
    CASE WHEN CARTON = 'y' THEN TRUE WHEN CARTON = 'n' THEN FALSE ELSE NULL END,
    CASE WHEN DROPOFFSIT = 'yes' THEN TRUE WHEN DROPOFFSIT = 'n' THEN FALSE ELSE NULL END,
    CASE WHEN EWASTE = 'y' THEN TRUE WHEN EWASTE = 'n' THEN FALSE ELSE NULL END,
    CASE WHEN METAL = 'y' THEN TRUE WHEN METAL = 'n' THEN FALSE ELSE NULL END,
    CASE WHEN O_MOTOROIL = 'y' THEN TRUE WHEN O_MOTOROIL = 'n' THEN FALSE ELSE NULL END,
    CASE WHEN PAID = 'yes' THEN TRUE WHEN PAID = 'n' THEN FALSE ELSE NULL END,
    CASE WHEN PAPER = 'y' THEN TRUE WHEN PAPER = 'n' THEN FALSE ELSE NULL END,
    CASE WHEN PLASTIC = 'y' THEN TRUE WHEN PLASTIC = 'n' THEN FALSE ELSE NULL END,
    CURRENT_TIMESTAMP(),
    CURRENT_TIMESTAMP()
FROM CSVREAD('classpath:mapData.csv', 'ID,LATITUDE,LONGITUDE,NAME,MUNICIPALITY,CITY,TYPE,OPERATION,GROUP_NAME,WEBSITE,OTHER,CAN_TIN,CARD,CARTON,DROPOFFSIT,EWASTE,METAL,O_MOTOROIL,PAID,PAPER,PLASTIC', 'charset=UTF-8 fieldSeparator=,');
