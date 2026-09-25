-- Seed Data Script: VIDYUT SPARES Initial Product Catalog & Payment Methods
-- Location: Vijayawada, Andhra Pradesh

-- 1. Initial Categories
INSERT INTO public.categories (id, name, slug, description, is_active) VALUES
('c1111111-1111-1111-1111-111111111111', 'Switches & Sockets', 'switches-sockets', 'Premium modular switches, socket outlets, regulators, and face plates for home & commercial installation.', true),
('c2222222-2222-2222-2222-222222222222', 'Wires & Cables', 'wires-cables', 'High-grade flame retardant copper wires, flexible cables, and heavy-duty industrial cables.', true),
('c3333333-3333-3333-3333-333333333333', 'Circuit Protection (MCB / RCCB)', 'circuit-protection', 'Miniature circuit breakers, residual current breakers, distribution boards, and isolators.', true),
('c4444444-4444-4444-4444-444444444444', 'LED Lighting & Fixtures', 'led-lighting', 'Energy efficient LED panel lights, tube lights, flood lights, and commercial downlights.', true),
('c5555555-5555-5555-5555-555555555555', 'Conduits & Fitting Spares', 'conduits-fittings', 'PVC conduits, junction boxes, circular boxes, bend pipes, and heavy clamps.', true),
('c6666666-6666-6666-6666-666666666666', 'Electrical Tools & Hardware', 'tools-hardware', 'Insulated pliers, wire strippers, voltage testers, insulation tapes, and cable ties.', true)
ON CONFLICT (slug) DO NOTHING;

-- 2. Initial Realistic Products
INSERT INTO public.products (id, category_id, name, slug, sku, brand, description, price, stock_quantity, low_stock_threshold, is_active) VALUES
('p1010101-0000-0000-0000-000000000001', 'c1111111-1111-1111-1111-111111111111', '16A 1-Way Modular Switch (White)', '16a-1way-modular-switch-white', 'VS-SW-016', 'Havells', 'Heavy duty 16 amp 240V 1-way modular switch for AC, water heater, and power socket control.', 95.00, 150, 20, true),
('p1010101-0000-0000-0000-000000000002', 'c1111111-1111-1111-1111-111111111111', '6A 3-Pin Modular Socket Outlet', '6a-3pin-modular-socket-outlet', 'VS-SK-006', 'Anchor Mona', 'Safety shuttered 6 amp 3-pin modular socket with fire resistant polycarbonate body.', 75.00, 200, 25, true),
('p1010101-0000-0000-0000-000000000003', 'c2222222-2222-2222-2222-222222222222', '2.5 sq mm FR PVC Insulated Copper Wire (90m Roll)', '25-sqmm-fr-pvc-copper-wire-90m', 'VS-WR-025', 'Finolex', 'High purity 99.9% electrolytic grade copper wire roll for house wiring and power circuits.', 2450.00, 35, 5, true),
('p1010101-0000-0000-0000-000000000004', 'c2222222-2222-2222-2222-222222222222', '1.5 sq mm Flame Retardant Wire (90m Red)', '15-sqmm-fr-wire-90m-red', 'VS-WR-015', 'Polycab', 'Premium insulation 1.5 sq mm single core wire suitable for lighting and switch connections.', 1650.00, 40, 8, true),
('p1010101-0000-0000-0000-000000000005', 'c3333333-3333-3333-3333-333333333333', '32A Double Pole C-Curve MCB (10kA)', '32a-double-pole-c-curve-mcb', 'VS-MCB-032DP', 'Legrand', 'High breaking capacity 32 Amp DP MCB for short circuit and overload safety protection.', 680.00, 25, 5, true),
('p1010101-0000-0000-0000-000000000006', 'c3333333-3333-3333-3333-333333333336', '16A Single Pole MCB (C-Series)', '16a-single-pole-mcb-c-series', 'VS-MCB-016SP', 'Schneider', 'Compact single pole MCB for sub-circuit protection in residential and commercial DB panels.', 180.00, 80, 10, true),
('p1010101-0000-0000-0000-000000000007', 'c4444444-4444-4444-4444-444444444444', '18W LED Slim Panel Light (Cool Day Light 6500K)', '18w-led-slim-panel-light', 'VS-LED-018P', 'Philips', 'Ultra-thin recessed ceiling LED panel light providing glare-free uniform illumination.', 420.00, 50, 10, true),
('p1010101-0000-0000-0000-000000000008', 'c4444444-4444-4444-4444-444444444444', '9W Cool White LED Bulb (B22 Cap)', '9w-cool-white-led-bulb-b22', 'VS-LED-009B', 'Crompton', 'Surge protected 9 watt LED bulb with up to 100 lm/W high lumens output.', 90.00, 120, 15, true),
('p1010101-0000-0000-0000-000000000009', 'c5555555-5555-5555-5555-555555555555', '25mm Heavy Duty PVC Conduit Pipe (3m Length)', '25mm-heavy-duty-pvc-conduit-pipe', 'VS-CND-025', 'Sudhakar', 'Rigid unplasticized PVC electrical conduit pipe for underground and concealed wall fitting.', 85.00, 100, 20, true),
('p1010101-0000-0000-0000-000000000010', 'c6666666-6666-6666-6666-666666666666', 'Heavy Duty Insulated Combination Pliers (8 inch)', 'heavy-duty-insulated-combination-pliers-8inch', 'VS-TL-PLI08', 'Taparia', 'High resistance 1000V insulated grip pliers for cutting, holding, and twisting electrical wires.', 340.00, 30, 4, true),
('p1010101-0000-0000-0000-000000000011', 'c6666666-6666-6666-6666-666666666666', 'Self-Locking Nylon Cable Ties 200mm (Pack of 100)', 'nylon-cable-ties-200mm-100pack', 'VS-HD-CT200', 'Vidyut Hardware', 'UV resistant durable black nylon cable ties for neat wire bundling and trunking management.', 120.00, 90, 15, true),
('p1010101-0000-0000-0000-000000000012', 'c3333333-3333-3333-3333-333333333333', '8-Way Vertical Metal Enclosure Distribution Board', '8-way-vertical-db-board', 'VS-DB-008V', 'Havells', 'Powder coated IP43 protection sheet steel distribution board with insulated neutral & earth bars.', 1450.00, 12, 3, true)
ON CONFLICT (sku) DO NOTHING;

-- 3. Payment Receiving Methods (Admin Configured Options)
INSERT INTO public.payment_methods (id, type, display_name, provider, upi_id, phone_number, instructions, is_active, sort_order) VALUES
('m1111111-0000-0000-0000-000000000001', 'UPI_NUMBER', 'PhonePe / Google Pay / Paytm', 'PhonePe & GPay', '9440146599@ybl', '9440146599', 'Transfer exact order amount to 9440146599. Copy the 12-digit UTR transaction ID and upload payment screenshot.', true, 1),
('m2222222-0000-0000-0000-000000000002', 'UPI_QR', 'VIDYUT SPARES Official UPI QR', 'BHIM / All UPI Apps', 'vidyutspares@okicici', NULL, 'Scan the QR code using any UPI application (PhonePe, GPay, Paytm, BHIM). Save receipt and submit UTR number.', true, 2),
('m3333333-0000-0000-0000-000000000003', 'BANK_TRANSFER', 'HDFC Bank Account Transfer', 'HDFC Bank Tarapet', NULL, '9440146599', 'Pay via NEFT / RTGS / IMPS to VIDYUT SPARES. Enter transaction reference number and upload credit advice screenshot.', true, 3)
ON CONFLICT DO NOTHING;
