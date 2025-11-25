-- Insertion des districts de Côte d'Ivoire (sans ON CONFLICT)
INSERT INTO public.districts (nom, est_actif)
SELECT nom, est_actif FROM (VALUES
  ('Abidjan', true),
  ('Bas-Sassandra', true),
  ('Comoé', true),
  ('Denguélé', true),
  ('Gôh-Djiboua', true),
  ('Lacs', true),
  ('Lagunes', true),
  ('Montagnes', true),
  ('Sassandra-Marahoué', true),
  ('Savanes', true),
  ('Vallée du Bandama', true),
  ('Woroba', true),
  ('Yamoussoukro', true),
  ('Zanzan', true)
) AS t(nom, est_actif)
WHERE NOT EXISTS (
  SELECT 1 FROM public.districts WHERE districts.nom = t.nom
);

-- Insertion des régions principales avec leurs districts
INSERT INTO public.regions (nom, code, district, chef_lieu, district_id, est_active, population)
SELECT 
  r.nom,
  r.code,
  r.district,
  r.chef_lieu,
  d.id as district_id,
  r.est_active,
  r.population
FROM (VALUES
  ('Haut-Sassandra', 'HS', 'Sassandra-Marahoué', 'Daloa', true, 1800000),
  ('Marahoué', 'MH', 'Sassandra-Marahoué', 'Bouaflé', false, 850000),
  ('Gôh', 'GH', 'Gôh-Djiboua', 'Gagnoa', false, 680000),
  ('Lôh-Djiboua', 'LD', 'Gôh-Djiboua', 'Divo', false, 730000),
  ('Agnéby-Tiassa', 'AT', 'Lagunes', 'Agboville', false, 610000),
  ('Grands-Ponts', 'GP', 'Lagunes', 'Dabou', false, 460000),
  ('La Mé', 'LM', 'Lagunes', 'Adzopé', false, 520000),
  ('San-Pédro', 'SP', 'Bas-Sassandra', 'San-Pédro', false, 880000),
  ('Gbôklé', 'GB', 'Bas-Sassandra', 'Sassandra', false, 400000),
  ('Nawa', 'NW', 'Bas-Sassandra', 'Soubré', false, 1200000),
  ('Abidjan', 'AB', 'Abidjan', 'Abidjan', false, 5600000)
) AS r(nom, code, district, chef_lieu, est_active, population)
JOIN public.districts d ON d.nom = r.district
WHERE NOT EXISTS (
  SELECT 1 FROM public.regions WHERE regions.nom = r.nom
);

-- Ajouter des départements et sous-préfectures pour Haut-Sassandra
INSERT INTO public.departements (nom, code, region_id, chef_lieu, est_actif)
SELECT 
  d.nom,
  d.code,
  r.id as region_id,
  d.chef_lieu,
  true
FROM (VALUES
  ('Daloa', 'DAL', 'Haut-Sassandra', 'Daloa'),
  ('Issia', 'ISS', 'Haut-Sassandra', 'Issia'),
  ('Vavoua', 'VAV', 'Haut-Sassandra', 'Vavoua'),
  ('Zoukougbeu', 'ZOU', 'Haut-Sassandra', 'Zoukougbeu')
) AS d(nom, code, region_nom, chef_lieu)
JOIN public.regions r ON r.nom = d.region_nom
WHERE NOT EXISTS (
  SELECT 1 FROM public.departements WHERE departements.nom = d.nom
);

-- Ajouter des sous-préfectures pour ces départements
INSERT INTO public.sous_prefectures (nom, code, departement_id, est_active)
SELECT 
  sp.nom,
  sp.code,
  dept.id as departement_id,
  true
FROM (VALUES
  ('Daloa', 'DAL-01', 'Daloa'),
  ('Bédiala', 'DAL-02', 'Daloa'),
  ('Gadouan', 'DAL-03', 'Daloa'),
  ('Issia', 'ISS-01', 'Issia'),
  ('Nahio', 'ISS-02', 'Issia'),
  ('Saïoua', 'ISS-03', 'Issia'),
  ('Vavoua', 'VAV-01', 'Vavoua'),
  ('Zoukougbeu', 'ZOU-01', 'Zoukougbeu')
) AS sp(nom, code, dept_nom)
JOIN public.departements dept ON dept.nom = sp.dept_nom
WHERE NOT EXISTS (
  SELECT 1 FROM public.sous_prefectures WHERE sous_prefectures.nom = sp.nom
);