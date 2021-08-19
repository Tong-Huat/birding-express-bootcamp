CREATE TABLE notes (id SERIAL PRIMARY KEY, date DATE, behaviour TEXT, flocksize INTEGER);

SELECT * FROM notes;

INSERT INTO notes (date, behaviour, flocksize) VALUES ('2021-01-27', 'watched a flock of yellow birds feeding for 5mins with clear views', 10);
INSERT INTO notes (date, behaviour, flocksize) VALUES ('2021-02-23', 'watched the birds flying for 5mins with clear views', 4);
INSERT INTO notes (date, behaviour, flocksize) VALUES ('2021-03-18', 'watched the birds resting for 5mins with clear views', 7);
INSERT INTO notes (date, behaviour, flocksize) VALUES ('2021-04-05', 'watched the bird foraging for 7mins with clear views', 20);

CREATE TABLE users (id SERIAL PRIMARY KEY, email TEXT, password TEXT);

