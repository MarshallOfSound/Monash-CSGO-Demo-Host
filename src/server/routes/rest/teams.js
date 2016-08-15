import express from 'express';

const router = express();

router.get('/', (req, res) => {
  res.json(Object.keys(global.teams).map((teamName) =>
    Object.assign({
      name: teamName,
    }, global.teams[teamName])
  ));
});

router.use('/:teamName', (req, res, next) => {
  req.team = global.teams[req.params.teamName]; // eslint-disable-line
  if (!req.team) {
    res.status(404).json({
      error: 'Team not found',
    });
  } else {
    next();
  }
});

router.get('/:teamName', (req, res) => {
  res.json(Object.assign({
    name: req.params.teamName,
  }, global.teams[req.paramsteamName]));
});

export default router;
