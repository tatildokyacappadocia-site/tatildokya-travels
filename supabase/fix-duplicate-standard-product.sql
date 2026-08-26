-- TATILDOKYA TRAVELS - FIX DUPLICATE "STANDARD" PRODUCT
-- Run once in Supabase SQL Editor.

-- 1) Deactivate the duplicate (English-spelled slug "standard" — not
--    referenced anywhere in the site's code, the real page uses the
--    Turkish-spelled "standart" slug below).
update public.products
set active = false
where slug = 'goreme-standard-hot-air-balloon-tour';

-- 2) Fix the name on the real, active product (the one the live site
--    actually uses) from "Standard" to the correct Turkish spelling
--    "Standart".
update public.products
set name = 'Göreme Standart Hot Air Balloon Tour'
where slug = 'goreme-standart-hot-air-balloon-tour';
