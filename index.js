/* eslint-disable max-len */
import express, { request, response } from 'express';
import methodOverride from 'method-override';
// eslint-disable-next-line import/no-unresolved
import pg from 'pg';

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
    console.log(`result: ${dataObj}`);

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
      return;
    }
    // console.log(data);
    const dataObj = { data };
    // console.log(`result: ${dataObj}`);

    // response.send(data);
    response.render('rendernote', dataObj);
  };

  // Query using pg.Pool instead of pg.Client
  pool.query(`SELECT * from notes WHERE id = ${id} `, listSpecificNote);
};

// CB to render blank note submission form
const renderNoteSubmission = (request, response) => {
  // if (request.cookies.loggedIn === undefined) {
  //   response.status(403).send('sorry, please log in!');
  //   return;
  // }
  console.log('submit request came in');
  response.render('submitnote');
};

// CB to add new note filled by user
const addNewNote = (request, response) => {
  const { date } = request.body;
  const { behaviour } = request.body;
  const { flocksize } = request.body;
  const insertData = `INSERT INTO notes (date, behaviour, flocksize) VALUES ('${date}', '${behaviour}', '${flocksize}')`;

  pool.query(insertData, (err, result, fields) => {
    if (err) {
      return response.status(500).send(err); /* return error message if insert unsuccessful */
    }
    console.log(`length:${result.rows.length}`);
    response.redirect('/');
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
  const { email } = request.body;
  const { password } = request.body;
  const insertData = `INSERT INTO users (email, password) VALUES ('${email}', '${password}')`;

  pool.query(insertData, (err, result, fields) => {
    if (err) {
      return response.status(500).send(err); /* return error message if insert unsuccessful */
    }
    response.redirect('/login');
  });
};

// CB to render blank note submission form
const renderLogin = (request, response) => {
  console.log('login request came in');
  response.render('login');
};

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

    if (result.rows.length === 0) {
      /* we didnt find a user with that email.
       the error for password and user are the same. don't tell the user which error they got for security reasons, otherwise people can guess if a person is a user of a given service. */
      response.status(403).send('sorry!');
      return;
    }

    const user = result.rows[0];

    if (user.password === request.body.password) {
      console.log('login successful');
      response.cookie('userId', user.id);
      response.cookie('loggedIn', true);
      response.redirect('/loginsuccess');
    } else {
      // password didn't match
      // the error for password and user are the same. don't tell the user which error they got for security reasons, otherwise people can guess if a person is a user of a given service.
      response.status(403).send('sorry!!');
    }
  });
};

// CB to render successful login page
const successfulLogin = (request, response) => {
  console.log('login request came in');
  response.render('loginsuccess');
};

// CB to del sighting
const logout = (request, response) => {
  // Remove element from DB at given index
  response.clearCookie('loggedIn');
  response.clearCookie('userId');
  // request.logout();
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
