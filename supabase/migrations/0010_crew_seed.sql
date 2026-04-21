-- Add free-form title column for crew (roles being finalised mid-May 2026).
-- RLS policies for public read + insert (staff entry UI later).
-- Seed 11 confirmed crew members with current best-fit roles.

alter table crew_member
  add column if not exists title text,
  add column if not exists initials text,
  add column if not exists color text;

create policy "public_read_crew_member" on crew_member
  for select using (true);

create policy "public_insert_crew_member" on crew_member
  for insert with check (true);

create policy "public_update_crew_member" on crew_member
  for update using (true) with check (true);

insert into crew_member (full_name, role, title, initials, color, active) values
('Kabir Rachure',     'rider',           'Rider · #610 Solo Men',                              'KR', '#fafafa', true),
('Sapna Rachure',     'crew_chief',      'Crew Chief',                                         'SR', '#fc4c02', true),
('Vishal Behal',      'cc_operator',     'Key Technical Dashboard · C&C',                      'VB', '#f59e0b', true),
('Satish Sharma',     'rv_crew',         'Bike maintenance + Nutrition + Route stats (Main)',  'SS', '#818cf8', true),
('Varun Venkit',      'rv_crew',         'Bike maintenance + Nutrition + Route stats (Deputy)', 'VV', '#818cf8', true),
('Sakthi Raja',       'rv_crew',         'GPX and Route expert',                               'SR', '#60a5fa', true),
('Jobe Mathews',      'media',           'Media and Information Management + Support',         'JM', '#ec4899', true),
('Vijayshree',        'follow_driver',   'Crew (role TBD mid-May)',                            'VJ', '#34d399', true),
('Prasanna Raja',     'follow_driver',   'Crew (role TBD mid-May)',                            'PR', '#34d399', true),
('Shail D',           'follow_driver',   'Crew (role TBD mid-May)',                            'SD', '#34d399', true),
('Shantanu Puralekar', 'follow_driver',   'Crew (role TBD mid-May)',                            'SP', '#34d399', true)
on conflict do nothing;
