//Init App
const mongoose = require('mongoose');
const db = mongoose.connection;
const express = require('express');
const path = require('path');
const app = express();
var bodyParser = require('body-parser');
//Bring in Models
let Article = require('./models/article');
let Athlete = require('./models/athlete');


const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const config = require('./config/database');
const passport = require('passport');


mongoose.connect(config.database, { useNewUrlParser: true });

db.on('error', console.error.bind(console, 'connection error:'));
//Check connection.
db.once('open', function(){console.log('connected to MongoDB.')});



app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


//Expression Session Middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

//Expression Messages Middleware
app.use(require('connect-flash')());
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//Express Validator Middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value){
    var namespace = param.split('.')
    , root        = namespace.shift()
    , formParam   = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']'
    }
    return {
      parm : formParam,
      msg : msg,
      value : value
    };
  }
}));

//Passport Config
require('./config/passport')(passport);
//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next){
  res.locals.user = req.user || null;
  next();
});

//Home Route
app.get('/', function (req, res) {
  Article.find({}, function(err, article){
    Athlete.find({}, (err, athlete) => {
        if (err) {
            console.log(err);
        } else {
            res.render('index', {
                articles_title: "Articles",
                articles: article,
                athletes_title: "Athletes",
                athletes: athlete
            });
        }
    });
  });
});

// Route Files
let articles = require('./routes/articles');
let users = require('./routes/users');
let athletes = require('./routes/athletes');

app.use('/articles', articles);
app.use('/athletes', athletes);
app.use('/users', users);



//Post Request
app.post('/', function (req, res) {
  res.send('you sent a post request.')
})

//set public folder.
app.use(express.static(path.join(__dirname, 'public')));
//Start the server.
app.listen(3000, () => console.log('Example app listening on port 3000!'))
