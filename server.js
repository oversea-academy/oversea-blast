const express = require('express');
const app = express();
const server = require('http').createServer(app);
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const nextHandler = nextApp.getRequestHandler();

const PORT = process.env.PORT || 3000;
const API = process.env.API || 'api';

const router = require('./routers');
const loader = require('./loaders');
const socket = require('./socket');

socket(server);

nextApp.prepare().then(async () => {
  await loader();

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use(`/${API}`, router);

  app.get('*', (req, res) => {
    return nextHandler(req, res);
  });

  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
