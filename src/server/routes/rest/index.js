import express from 'express';

import demoRouter from './demos';
import teamRouter from './teams';

const router = express();

router.use('/demos', demoRouter);
router.use('/teams', teamRouter);

module.exports = router;
