const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs'); 
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

const userData = [];

app.post('/api/user/register', (req, res) => {
    
  const { username, password } = req.body;
  console.log(username, password)

  if (userData.some((user) => user.username === username)) {
    return res.status(400).json({ error: 'Username already taken' });
  }
  //unique ID for user
  const userId = uuidv4();

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }

    userData.push({ id: userId, username, password: hashedPassword });

    const createdUser = { id: userId, username, password:hashedPassword};
    return res.status(201).json(createdUser); 
  });
});

app.get('/api/user/list', (req, res) => {
    res.json(userData);
  });

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});