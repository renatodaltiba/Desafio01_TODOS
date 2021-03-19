const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { nickname } = request.headers;

  const user = users.find((user) => user.nickname === nickname)

  if(!user){
    return response.status(400).json({ error: "usuario não encontrado"});
  }
  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
    const { nickname, name } = request.body;
    
    const userAlreadyExists = users.some((user) => user.nickname === nickname);

    if(userAlreadyExists == false){
      users.push({
        nickname,
        name,
        id: uuidv4(),
        todos: []
      })

    return response.status(201).send();
    }else{
      return response.status(400).json({
        error: "Usúario já existe"
      })
    }
  });

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  
  const todos = user.todos.filter((nickname) => nickname === nickname)

  return response.json(todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { user } = request;

  const dadosDaOperacao = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(dadosDaOperacao);

  return response.status(201).send()
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find(todo => todo.id === id)
  if (!todo){
    return response.status(404).json ({error: "Todo não encontrado"})
  }
  todo.title = title;

  todo.deadline = new Date(deadline)

  return response.json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { id } = request.params;

  const todo = user.todos.find(todo => todo.id === id)

  if (!todo){
    return response.status(404).json ({error: "Todo não encontrado"})
  }

  todo.done = true;

  return response.status(200).send();
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
    const { user } = request;

    const { id } = request.params;

    const todo = user.todos.findIndex(todo => todo.id === id)

    if (todoIndex === -1){
      return response.status(404).json ({error: "Todo não encontrado"})
    }

    user.todos.splice(todoIndex, 1)

  });

module.exports = app;