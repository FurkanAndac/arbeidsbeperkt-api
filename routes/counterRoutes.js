const express = require('express');
const router = express.Router();
const mongoService = require('../services/mongoService');

router.get('/get-counter', async (req, res) => {
  try {
    const db = await mongoService.connect();
    const counterCollection = db.collection('counter');

    const counter = await counterCollection.findOne({ _id: 'arbeidsbeperkt_count' });

    res.json({
      count: counter ? counter.count : 0
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving counter',
      error
    });
  }
});

module.exports = router;
