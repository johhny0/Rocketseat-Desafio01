const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {

  const { username } = request.headers

  const user = users.find(u => u.username === username);

  if (!user) {
    return response.status(401).json({ error: "User not found" });
  }

  request.user = user;

  return next();
}

app.get('/users', (request, response) => {
  return response.json(users);
})

app.post('/users', (request, response) => {

  const { username, name } = request.body;

  const userAlreadyExists = users.some(u => u.username === username);

  if (!username || !name) {
    return response.status(400).json({ error: "Username And Name Could Not Be Empty" });
  }

  if (userAlreadyExists) {
    return response.status(400).json({ error: "User Already Exists" });
  }

  const user = { id: uuidv4(), username, name, created_at: new Date(), todos: [] };

  users.push(user);

  return response.json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { title, deadline } = request.body;

  const todo = { id: uuidv4(), title, deadline, done: false, created_at: new Date() }

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todo = user.todos.find(t => t.id === id);

  if (!todo) {
    return response.status(404).json({ error: "To-Do Not Found" });
  }

  todo.title = title
  todo.deadline = deadline

  return response.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find(t => t.id === id);

  if (!todo) {
    return response.status(404).json({ error: "To-Do Not Found" });
  }

  todo.done = true;

  return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find(t => t.id === id);
  
  if (!todo) {
    return response.status(404).json({ error: "To-Do Not Found" });
  }

  user.todos = user.todos.filter(t => t.id !== id);

  return response.status(204).send();
});

module.exports = app;