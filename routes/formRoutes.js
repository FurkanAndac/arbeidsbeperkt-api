const express = require('express');
const router = express.Router();
const mongoService = require('../services/mongoService');

// Route to submit a form to the waiting list
router.post('/submit-form', async (req, res) => {
  const { naam, hoogstgenotenOpleiding, woonplaats, bedrijf, leeftijd, type } = req.body; // Added 'type'

  try {
    const db = await mongoService.connect();
    const wachtlijstCollection = db.collection('wachtlijst_formulieren'); // Changed to wachtlijst_formulieren

    // Insert form data into wachtlijst_formulieren
    await wachtlijstCollection.insertOne({
      naam,
      hoogstgenotenOpleiding,
      woonplaats,
      bedrijf,
      leeftijd,
      type, // Added 'type'
      status: 'pending' // Added status to track form status
    });

    res.status(200).json({ message: 'Form submitted to waiting list' });
  } catch (error) {
    res.status(500).json({
      message: 'Error submitting form',
      error: error.message,
    });
  }
});

// Route to get all wachtlijst_formulieren
router.get('/wachtlijst-formulieren', async (req, res) => {
  try {
    const db = await mongoService.connect();
    const wachtlijstCollection = db.collection('wachtlijst_formulieren'); // Collection for wachtlijst_formulieren
    
    // Retrieve all documents from wachtlijst_formulieren
    const formulieren = await wachtlijstCollection.find().toArray();
    
    res.status(200).json(formulieren);
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving wachtlijst formulieren',
      error: error.message,
    });
  }
});

const { ObjectId } = require('mongodb'); // Make sure ObjectId is imported

router.post('/accept-formulier/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const db = await mongoService.connect();
        const wachtlijstCollection = db.collection('wachtlijst_formulieren');
        const bedrijvenCollection = db.collection('bedrijven_formulieren');

        // Find the formulier by ID
        const formulier = await wachtlijstCollection.findOne({ _id: new ObjectId(id) });

        if (!formulier) {
            return res.status(404).json({ message: 'Formulier not found' });
        }

        // Insert formulier into bedrijven_formulieren collection
        const insertResult = await bedrijvenCollection.insertOne(formulier);
        
        if (!insertResult.acknowledged) {
            throw new Error('Failed to insert formulier into bedrijven_formulieren');
        }

        // Delete formulier from wachtlijst_formulieren collection
        const deleteResult = await wachtlijstCollection.deleteOne({ _id: new ObjectId(id) });

        if (deleteResult.deletedCount === 0) {
            throw new Error('Failed to delete formulier from wachtlijst_formulieren');
        }

        res.status(200).json({ message: 'Formulier accepted' });

    } catch (error) {
        console.error('Failed to accept formulier:', error);
        res.status(500).json({ message: 'Failed to accept formulier', error: error.message });
    }
});



// Route to deny a form
router.post('/deny-formulier/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const db = await mongoService.connect();
    const wachtlijstCollection = db.collection('wachtlijst_formulieren');

    // Remove the form from wachtlijst_formulieren
    const result = await wachtlijstCollection.findOneAndDelete({ _id: new mongoService.ObjectId(id) });
    
    if (result.value) {
      res.status(200).json({ message: 'Form denied and removed from the waiting list' });
    } else {
      res.status(404).json({ message: 'Form not found' });
    }
  } catch (error) {
    res.status(500).json({
      message: 'Error denying formulier',
      error: error.message,
    });
  }
});

// Route to get the count of arbeidsbeperkt_formulieren
router.get('/formulieren-count', async (req, res) => {
  try {
    const db = await mongoService.connect();
    const arbeidsbeperktFormulierenCollection = db.collection('arbeidsbeperkt_formulieren');
    
    // Count the number of documents in the 'arbeidsbeperkt_formulieren' collection
    const count = await arbeidsbeperktFormulierenCollection.countDocuments();
    
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving form count',
      error: error.message,
    });
  }
});

// Route to get all bedrijven_formulieren
router.get('/bedrijven-formulieren', async (req, res) => {
  try {
    const db = await mongoService.connect();
    const bedrijvenCollection = db.collection('bedrijven_formulieren');
    
    // Retrieve all documents from bedrijven_formulieren
    const bedrijven = await bedrijvenCollection.find().toArray();
    
    res.status(200).json(bedrijven);
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving bedrijven formulieren',
      error: error.message,
    });
  }
});

module.exports = router;
