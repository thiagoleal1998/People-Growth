-- Rebrand: People & Growth -> Festina. Aligns categories still using the
-- old default rotation colors (#4361EE blue, #06D6A0 green) with the new
-- brand palette (#315E9C Azul Iridescente, #C89A4A Dourado Clássico).
-- Deliberately does NOT touch #FFB703 (amber) — that color wasn't part of
-- the requested swap — nor any category a user may have manually set to a
-- color outside this exact default rotation.

update categories set color = '#315E9C' where color = '#4361EE';
update categories set color = '#C89A4A' where color = '#06D6A0';
