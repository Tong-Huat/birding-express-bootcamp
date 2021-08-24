DROP TABLE notes;
DROP TABLE species;
DROP TABLE birds_behaviours;
DROP TABLE notes_behaviour;
DROP TABLE users;


CREATE TABLE IF NOT EXISTS notes (id SERIAL PRIMARY KEY, date DATE, behaviour TEXT, flocksize INTEGER, user_id INTEGER, species_id INTEGER);
CREATE TABLE IF NOT EXISTS species (id SERIAL PRIMARY KEY, name TEXT, scientific_name TEXT);
CREATE TABLE IF NOT EXISTS birds_behaviours (id SERIAL PRIMARY KEY, birds_behaviour TEXT);
CREATE TABLE IF NOT EXISTS notes_behaviour (id SERIAL PRIMARY KEY, note_index INTEGER, behaviour_id INTEGER);
CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, email TEXT, password TEXT);


-- INSERT INTO notes (date, behaviour, flocksize, user_id) VALUES ('2021-01-27', 'watched a flock of yellow birds feeding for 5mins with clear views', 10, 1);
-- INSERT INTO notes (date, behaviour, flocksize, user_id) VALUES ('2021-02-23', 'watched the birds flying for 5mins with clear views', 4, 2);
-- INSERT INTO notes (date, behaviour, flocksize, user_id) VALUES ('2021-03-18', 'watched the birds resting for 5mins with clear views', 7, 3);
-- INSERT INTO notes (date, behaviour, flocksize, user_id) VALUES ('2021-04-05', 'watched the bird foraging for 7mins with clear views', 20, 2);


INSERT INTO species (name, scientific_name) VALUES ('King Quail','Excalfactoria chinensis');
INSERT INTO species (name, scientific_name) VALUES ('Red Junglefow','Gallus gallus');
INSERT INTO species (name, scientific_name) VALUES ('Wandering Whistling Duck','	Dendrocygna arcuata');
INSERT INTO species (name, scientific_name) VALUES ('Cotton Pygmy Goose','Nettapus coromandelianus');
INSERT INTO species (name, scientific_name) VALUES ('Grey Nightjar','Caprimulgus jotaka');
INSERT INTO species (name, scientific_name) VALUES ('Common Swift','Apus apus');


INSERT INTO birds_behaviours (birds_behaviour) VALUES ('Walking'), ('Drinking'),('Gathering nesting materials'), ('Hunting'),('Soaring'), ('Perched'),('Feeding'), ('Flocking');
