/* eslint-disable max-len */
import express, { request, response } from 'express';
import methodOverride from 'method-override';
// eslint-disable-next-line import/no-unresolved
import pg from 'pg';
import jsSHA from 'jssha';
import cookieParser from 'cookie-parser';
// const PORT = process.argv[2];

const app = express();
const SALT = 'i like cocomelon';

app.set('view engine', 'ejs');
// Override POST requests with query param ?_method=PUT to be PUT requests
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

// Initialise DB connection
const { Pool } = pg;
const pgConnectionConfigs = {
  user: 'midzham',
  host: 'localhost',
  database: 'birding',
  port: 5432, // Postgres server always runs on this port by default
};

const pool = new Pool(pgConnectionConfigs);

// CB to render index page with all the notes
const renderNotesIndex = (request, response) => {
  console.log('index request came in');

  const listAllNotes = (error, result) => {
    const data = result.rows;
    if (error) {
      console.log('Error executing query', error.stack);
      response.status(503).send(result.rows);
      return;
    }
    console.log(data);
    const dataObj = { data };
    // console.log(`result: ${dataObj}`);

    // response.send(data);
    response.render('index', dataObj);
  };

  // Query using pg.Pool instead of pg.Client
  pool.query('SELECT * from notes', listAllNotes);
};

// CB to render specifi note request
const renderSpecificNote = (request, response) => {
  console.log('note request came in');
  const { id } = request.params;

  const listSpecificNote = (error, result) => {
    const data = result.rows;
    console.log(data);

    if (error) {
      console.log('Error executing query', error.stack);
      response.status(503).send(result.rows);
    }
    const dataObj = { data };
    // console.log(`result: ${dataObj}`);

    response.render('rendernote', dataObj);

    // }
  };

  // Query using pg.Pool instead of pg.Client
  pool.query(`SELECT notes.id, notes.date, notes.behaviour, notes.flocksize, notes.user_id, species.name AS species_name FROM notes INNER JOIN species ON notes.species_id = species.id INNER JOIN users ON notes.user_id = users.id INNER JOIN notes_behaviour ON notes_behaviour.note_id = notes.id WHERE notes.id = 
  ${id}`, listSpecificNote);
};

// CB to render blank note submission form
const renderNoteSubmission = (request, response) => {
  console.log('submit request came in');
  // // extract loggedInHash and userId from request cookies
  // const { loggedInHash, userId } = request.cookies;
  // console.log('loggedinHASh', loggedInHash.request.cookies);
  // console.log('userID', userId.request.cookies);
  // // create new SHA object
  // const shaObj = new jsSha('SHA-512', 'TEXT', { encoding: 'UTF8' });
  // // reconstruct the hashed cookie string
  // const unhashedCookieString = `${userId}-${SALT}`;
  // shaObj.update(unhashedCookieString);
  // const hashedCookieString = shaObj.getHash('HEX');

  // // verify if the generated hashed cookie string matches the request cookie value.
  // // if hashed value doesn't match, return 403.
  // if (hashedCookieString !== request.cookies.loggedInHash) {
  //   response.status(403).send('please login!');
  //   return;
  // }
  pool.query('SELECT * FROM species', (error, result) => {
    const data = { species: result.rows };
    pool.query('SELECT * FROM birds_behaviours', (behaviourError, behaviourResult) => {
      const data2 = { behaviours: behaviourResult.rows };
      console.log(data2);
      response.render('submitnote', { data, data2 });
    });
  });
};

// CB to add new note filled by user
const addNewNote = (request, response) => {
  const cookiesArray = request.headers.cookie.split(';').map((cookie) => cookie.trim());
  const cookiesHashmap = cookiesArray.reduce((all, cookie) => {
    const [cookieName, value] = cookie.split('=');
    return {
      [cookieName]: value,
      ...all,
    };
  }, {});
  console.log(`3:${cookiesHashmap.userId}`);
  const { userId } = cookiesHashmap;
  // console.log(`2:${userId}`);
  // const { userId } = request.cookies;
  console.log('userid:', userId);
  const { date } = request.body;
  const { flocksize } = request.body;
  const { speciesId } = request.body;
  const { behaviours } = request.body;
  const insertEntryQuery = `INSERT INTO notes (date, flocksize, user_id, species_id, behaviour) VALUES ('${date}', '${flocksize}', '${userId}', '${speciesId}', '${behaviours}') RETURNING id`;
  console.log(date, flocksize, speciesId, userId);
  // eslint-disable-next-line no-loop-func
  pool.query(insertEntryQuery, (insertEntryErr, insertEntryResult) => {
    if (insertEntryErr) {
      console.log('Insert error', insertEntryErr);
    } else {
      const noteId = insertEntryResult.rows[0].id;
      console.log(noteId);
      console.log('behaviour:', behaviours);
      behaviours.forEach((behaviour) => {
        const behaviourIdQuery = `SELECT id FROM birds_behaviours WHERE birds_behaviour = '${behaviour}'`;

        pool.query(behaviourIdQuery, (behaviourIdQueryError, behaviourIdQueryResult) => {
          if (behaviourIdQueryError) {
            console.log('error', behaviourIdQueryError);
          } else {
            console.log('behaviour id:', behaviourIdQueryResult.rows);
            const behaviourId = behaviourIdQueryResult.rows[0].id;
            const behaviourData = [noteId, behaviourId];

            const notesBehaviourEntry = 'INSERT INTO notes_behaviour (note_id, behaviour_id) VALUES ($1, $2)';

            pool.query(notesBehaviourEntry, behaviourData, (notesBehaviourEntryError, notesBehaviourEntryResult) => {
              if (notesBehaviourEntryError) {
                console.log('error', notesBehaviourEntryError);
              } else {
                console.log('done');
              }
            });
          }
        });
      });
      response.redirect('/');
    }
  });
};

// CB to render blank note submission form
const renderRegistration = (request, response) => {
  console.log('registration request came in');
  response.render('signuppage');
};

// CB to retrieve user's data for registration
const registerUser = (request, response) => {
  console.log('retrieving user data');
  // initialise the SHA object
  const shaObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
  // input the password from the request to the SHA object
  shaObj.update(request.body.password);
  // get the hashed password as output from the SHA object
  const hashedPassword = shaObj.getHash('HEX');

  // store the hashed password in our DB
  const values = [request.body.email, hashedPassword];

  const insertData = 'INSERT INTO users (email, password) VALUES ($1, $2)';

  pool.query(insertData, values, (err, result) => {
    if (err) {
      return response.status(500).send(err); /* return error message if insert unsuccessful */
    }
    response.redirect('/login');
  });
};

// CB to render login form
const renderLogin = (request, response) => {
  console.log('login request came in');
  response.render('login');
};

// CB to verify login details and login to acct if successful verification
const loginAccount = (request, response) => {
  console.log('trying to login');
  const values = [request.body.email];
  console.log(values);
  pool.query('SELECT * FROM users WHERE email=$1', values, (error, result) => {
    if (error) {
      console.log('Error executing query', error);
      response.status(503).send('request failed');
      return;
    }

    //  we didnt find a user with that email.
    if (result.rows.length === 0) {
      /* the error for password and user are the same. don't tell the user which error they got for security reasons, otherwise people can guess if a person is a user of a given service. */
      response.status(403).send('sorry!');
      return;
    }

    // const shaObj = new jsSha('SHA-512', 'TEXT', { encoding: 'UTF8' });

    // const unhashedCookieString = `${result.rows[0].id}-${SALT}`;
    // // generate a hashed cookie string using SHA object
    // shaObj.update(unhashedCookieString);
    // const hashedCookieString = shaObj.getHash('HEX');
    // // set the loggedInHash and userId cookies in the response
    // response.cookie('loggedInHash', hashedCookieString);
    // response.cookie('userId', result.rows[0].id);
    // // end the request-response cycle
    // console.log('login successful');

    // create new SHA object
    const shaObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
    shaObj.update(request.body.password);
    const hashedPassword = shaObj.getHash('HEX');
    console.log(hashedPassword);
    if (result.rows[0].password === hashedPassword) {
      response.cookie('loggedIn', true);

      const shaObj1 = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
      // create an unhashed cookie string based on user ID and salt
      const unhashedCookieString = `${result.rows[0].id}-${SALT}`;
      shaObj1.update(unhashedCookieString);
      const hashedCookieString = shaObj1.getHash('HEX');
      response.cookie('loggedInHash', hashedCookieString);
      response.cookie('userId', result.rows[0].id);
      response.redirect('/loginsuccess');
    } else {
      response.status(403).send('not successful');
    }
  });
};

// CB to render successful login page
const successfulLogin = (request, response) => {
  console.log('login request came in');
  response.render('loginsuccess');
};

// CB to del cookies and logout
const logout = (request, response) => {
  // Remove cookies from response header to log out
  response.clearCookie('loggedIn');
  response.clearCookie('userId');
  response.redirect('/');
};

// CB to del note
const deleteNote = (request, response) => {
  // Remove element from DB at given index
  const { id } = request.params;
  console.log('id:', id);
  const getNoteDataQuery = `SELECT * FROM notes WHERE id = ${id}`;
  pool.query(getNoteDataQuery, (getNoteDataQueryErr, getNoteDataQueryResult) => {
    if (getNoteDataQueryErr) {
      console.log('error', getNoteDataQueryErr);
    } else {
      const noteData = getNoteDataQueryResult.rows[0];
      console.log('note Data: ', noteData);

      const deleteNoteQuery = `DELETE FROM notes WHERE id = ${id}`;
      pool.query(deleteNoteQuery, (deleteNoteError, deleteNoteResult) => {
        if (deleteNoteError) {
          console.log('error', deleteNoteError);
        } else
        {
          response.redirect('/');
        }
      });
    }
  });
};

app.get('/', renderNotesIndex);
app.get('/note/:id', renderSpecificNote);
app.get('/note', renderNoteSubmission);
app.post('/note', addNewNote);
app.get('/signup', renderRegistration);
app.post('/signup', registerUser);
app.get('/login', renderLogin);
app.post('/login', loginAccount);
app.get('/loginsuccess', successfulLogin);
app.get('/logout', logout);
app.delete('/note/:id', deleteNote);

app.listen(3004);
