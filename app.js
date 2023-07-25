const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs'); 
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(session({
    secret: 'randomstringofletters',
    resave: false,
    saveUninitialized: true,
  }));

const userData = [];
const todosData = {};

const checkForLogin = (req, res, next) => {
    if (req.session.userId) {
        return res.redirect('/');
      }
      next();
    };
const checkAuth = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json('Unauthorized');
    }
    next();
    };  

    //post user todos
app.post('/api/todos', checkAuth, (req, res) => {
    console.log(req.body)
    const { todo } = req.body;
    const userId = req.session.userId;

    if (!todosData[userId]) {
        todosData[userId] = [];
      }
    
    todosData[userId].push(todo);
    const response = {
        id: userId,
        todos: todosData[userId],
      };

    res.json(response);
});    

//get all todos
app.get('/api/todos/list', (req, res) => {
    res.json(todosData);
});

app.post('/api/user/register', checkForLogin, (req, res) => {
    
  const { username, password } = req.body;

  if (userData.some((user) => user.username === username)) {
    return res.status(400).json('Username already taken');
  }
  //unique ID for user
  const userId = uuidv4();

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json('Internal server error');
    }

    userData.push({ id: userId, username, password: hashedPassword });

    const createdUser = { id: userId, username, password:hashedPassword};
    return res.status(200).json(createdUser); 
  });
});

app.post('/api/user/login', checkForLogin, (req, res) => {
    const { username, password } = req.body;
  
    const user = userData.find((user) => user.username === username);
  
    if (!user) {
      return res.status(401).json("No such user");
    }
  
    bcrypt.compare(password, user.password, (err, result) => {
      if (err) {
        return res.status(500).json('server error');
      }
  
      if (result) {
        req.session.userId = user.id;
        return res.status(200).json('Login successful');
      } else {
        return res.status(401).json('Invalid credentials');
      }
    });
  });

  app.get('/api/secret', (req, res) => {
    if (req.session.userId){
    res.status(200).json( 'You have access to the secret route!');
    } else {
    res.status(401).json('Unauthorized');
        }
    });

app.get('/api/user/list', (req, res) => {
    res.json(userData);
  });

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});