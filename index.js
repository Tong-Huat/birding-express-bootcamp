/* eslint-disable max-len */
import express, { request, response } from 'express';
import methodOverride from 'method-override';
// eslint-disable-next-line import/no-unresolved
import pg from 'pg';
import jsSHA from 'jssha';
// const PORT = process.argv[2];

const app = express();

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
  pool.query(`SELECT notes.id, notes.date, notes.behaviour, notes.flocksize, notes.user_id, species.name AS species_name FROM notes INNER JOIN species ON notes.species_id = species.id WHERE notes.id = ${id}`, listSpecificNote);
};

// CB to render blank note submission form
const renderNoteSubmission = (request, response) => {
  console.log('submit request came in');
  // if (request.cookies.loggedIn === undefined) {
  //   response.status(403).send('sorry, please log in!');
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
  console.log(`2:${userId}`);
  const { date } = request.body;
  const { flocksize } = request.body;
  const { speciesId } = request.body;
  const { behaviours } = request.body;
  const insertEntryQuery = `INSERT INTO notes (date, flocksize, user_id, species_id) VALUES ('${date}', '${flocksize}', '${userId}', '${speciesId}') RETURNING id`;
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

            const notesBehaviourEntry = 'INSERT INTO notes_behaviour (note_index, behaviour_id) VALUES ($1, $2)';

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
      console.log('Error executing query', error.stack);
      response.status(503).send(result.rows);
      return;
    }

    //  we didnt find a user with that email.
    if (result.rows.length === 0) {
      /* the error for password and user are the same. don't tell the user which error they got for security reasons, otherwise people can guess if a person is a user of a given service. */
      response.status(403).send('sorry!');
      return;
    }

    // get user record from results
    const user = result.rows[0];
    // initialise SHA object
    const shaObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
    // input the password from the request to the SHA object
    shaObj.update(request.body.password);
    // get the hashed value as output from the SHA object
    const hashedPassword = shaObj.getHash('HEX');

    // If the user's hashed password in the database does not match the hashed input password, login fails
    if (user.password !== hashedPassword) {
      // the error for incorrect email and incorrect password are the same for security reasons.
      // This is to prevent detection of whether a user has an account for a given service.
      response.status(403).send('login failed!');
    } else {
      console.log('login successful');

      response.cookie('loggedIn', true);
      response.redirect('/loginsuccess');
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

app.listen(3004);
