import path from 'path';
import express from 'express';

const router = express();

router.get('/', (req, res) => {
  res.json(global.demos);
});

router.use('/:id', (req, res, next) => {
  req.demo = global.demos.find((d) => d.id === req.params.id); // eslint-disable-line
  if (!req.demo) {
    res.status(404).json({
      error: 'Demo not found',
    });
  } else {
    next();
  }
});

router.get('/:id', (req, res) => {
  res.json(req.demo);
});

router.get('/:id/download', (req, res) => {
  res.download(path.resolve(__dirname, '../../../../demos/', req.demo.fileName));
});

export default router;
