CREATE TABLE notes (id SERIAL PRIMARY KEY, details TEXT, behaviour TEXT, flocksize TEXT);

SELECT * FROM birding;

INSERT INTO notes (details, behaviour, flocksize) VALUES ('4th August, friday, watched the bird feeding for 5mins with clear views', 'feeding and resting', '10 birds');
INSERT INTO notes (details, behaviour, flocksize) VALUES ('4th Sep, friday, watched the bird feeding for 5mins with clear views', 'feeding and resting', '4 birds, same species');
INSERT INTO notes (details, behaviour, flocksize) VALUES ('4th July, friday, watched the bird feeding for 5mins with clear views', 'feeding and resting', '7 birds, part of mixed flocks');
INSERT INTO notes (details, behaviour, flocksize) VALUES ('4th Dec, friday, watched the bird feeding for 5mins with clear views', 'feeding and resting', '20 birds, same flock and species');
