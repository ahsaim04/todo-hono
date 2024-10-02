import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { v4  } from 'uuid';

interface Todo {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const app = new Hono();

let todos: Todo[] = [];

app.get('/', (c) => {
  return c.text(`Server is Running!`);
});

app.post('/todos', async (c) => {
  const { title, status = 'todo' } = await c.req.json() as { title: string; status?: string };

  if (!title) {
    return c.status(400).json({ error: 'Title is required' });
  }

  const todo: Todo = {
    id: v4(),
    title,
    status,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  todos.push(todo);

  return c.json({
    message: 'Todo created',
    todo: todo,
  }, 201);
});

app.get('/todos', (c) => {
  return c.json(todos);
});

app.get('/todos/:id', (c) => {
  const { id } = c.req.param();
  const todo = todos.find((t) => t.id === id);

  if (!todo) {
    return c.status(404).json({ error: 'Todo not found' });
  }

  return c.json(todo);
});

app.put('/todos/:id', async (c) => {
  const { id } = c.req.param();
  const { title, status } = await c.req.json() as { title?: string; status?: string };

  const todoIndex = todos.findIndex((t) => t.id === id);
  if (todoIndex === -1) {
    return c.status(404).json({ error: 'Todo not found' });
  }

  const updatedTodo: Todo = {
    ...todos[todoIndex],
    title: title ?? todos[todoIndex].title,
    status: status ?? todos[todoIndex].status,
    updatedAt: new Date().toISOString(),
  };

  todos[todoIndex] = updatedTodo;

  return c.json({
    message: 'Todo updated',
    todo: updatedTodo,
  });
});

app.delete('/todos/:id', (c) => {
  const { id } = c.req.param();
  const todoIndex = todos.findIndex((t) => t.id === id);

  if (todoIndex === -1) {
    return c.status(404).json({ error: 'Todo not found' });
  }

  todos.splice(todoIndex, 1);

  return c.json({ message: 'Todo deleted' });
});

app.all('*', (c) => {
  return c.status(404).json({ error: 'Not found' });
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
