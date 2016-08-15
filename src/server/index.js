import compression from 'compression';
import express from 'express';
import fs from 'fs';
import path from 'path';

import Demo from './lib/Demo';
import restRouter from './routes/rest';

const app = express();

global.demos = [];

app.use(compression());

app.use('/', express.static(path.resolve(__dirname, '../public')));

app.use('/rest', restRouter);

global.demos = [];
global.teams = {};

fs.readdir(path.resolve('./demos'), (err, files) => {
  if (err) return console.error('Failed to read demos folder');

  files.filter((filePath) => /.*\.dem/g.test(filePath))
    .forEach((filePath) => {
      global.demos.push(new Demo(path.resolve(`./demos/${filePath}`)));
    });
  global.demos = global.demos.filter((demo) => demo.valid)
    .sort((a, b) => b.timestamp - a.timestamp);
  global.demos.forEach((demo) => {
    if (!global.teams[demo.T_teamName]) global.teams[demo.T_teamName] = { games: [] };
    global.teams[demo.T_teamName].games.push(demo.id);
    if (!global.teams[demo.CT_teamName]) global.teams[demo.CT_teamName] = { games: [] };
    global.teams[demo.CT_teamName].games.push(demo.id);
  });

  app.listen(3030, () => console.log('Listening on 3030'));
});
