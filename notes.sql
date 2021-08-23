CREATE TABLE notes (id SERIAL PRIMARY KEY, date DATE, behaviour TEXT, flocksize INTEGER, user_id INTEGER);
CREATE TABLE species (id SERIAL PRIMARY KEY, name TEXT, scientific_name TEXT);
CREATE TABLE birds_behaviours (id SERIAL PRIMARY KEY, birds_behaviour TEXT);

SELECT * FROM notes;
SELECT * FROM species;

INSERT INTO notes (date, behaviour, flocksize, user_id) VALUES ('2021-01-27', 'watched a flock of yellow birds feeding for 5mins with clear views', 10, 1);
INSERT INTO notes (date, behaviour, flocksize, user_id) VALUES ('2021-02-23', 'watched the birds flying for 5mins with clear views', 4, 2);
INSERT INTO notes (date, behaviour, flocksize, user_id) VALUES ('2021-03-18', 'watched the birds resting for 5mins with clear views', 7, 3);
INSERT INTO notes (date, behaviour, flocksize, user_id) VALUES ('2021-04-05', 'watched the bird foraging for 7mins with clear views', 20, 2);

CREATE TABLE users (id SERIAL PRIMARY KEY, email TEXT, password TEXT);

UPDATE notes SET user_id = '2' WHERE id=2;
UPDATE notes SET user_id = '3' WHERE id=3;
UPDATE notes SET user_id = '4' WHERE id=4;
UPDATE notes SET user_id = '5' WHERE id=5;
UPDATE notes SET user_id = '6' WHERE id=6;
UPDATE notes SET user_id = '7' WHERE id=7;

INSERT INTO species (name, scientific_name) VALUES ('King Quail','Excalfactoria chinensis');
INSERT INTO species (name, scientific_name) VALUES ('Red Junglefow','Gallus gallus');
INSERT INTO species (name, scientific_name) VALUES ('Wandering Whistling Duck','	Dendrocygna arcuata');
INSERT INTO species (name, scientific_name) VALUES ('Cotton Pygmy Goose','Nettapus coromandelianus');
INSERT INTO species (name, scientific_name) VALUES ('Grey Nightjar','Caprimulgus jotaka');
INSERT INTO species (name, scientific_name) VALUES ('Common Swift','Apus apus');

ALTER TABLE notes
ADD species_id INTEGER;

UPDATE notes SET behaviour_id = '1' WHERE id=1;
UPDATE notes SET behaviour_id = '2' WHERE id=2;
UPDATE notes SET behaviour_id = '3' WHERE id=3;
UPDATE notes SET behaviour_id = '4' WHERE id=4;
UPDATE notes SET behaviour_id = '2' WHERE id=5;
UPDATE notes SET behaviour_id = '1' WHERE id=6;
UPDATE notes SET behaviour_id = '4' WHERE id=7;
UPDATE notes SET behaviour_id = '3' WHERE id=8;
UPDATE notes SET behaviour_id = '1' WHERE id=9;
UPDATE notes SET user_id = '2' WHERE id=10;

INSERT INTO birds_behaviours (birds_behaviour) VALUES ('Walking'), ('Drinking'),('Gathering nesting materials'), ('Hunting'),('Soaring'), ('Perched'),('Feeding'), ('Flocking');
