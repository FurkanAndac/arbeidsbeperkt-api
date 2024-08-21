const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db = null;

async function connectDb() {
  if (db) return db;
  try {
    await client.connect();
    db = client.db('mydatabase'); // Replace with your database name
    console.log('Connected to MongoDB!');
    return db;
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    throw err;
  }
}

async function incrementCounter() {
  try {
    const db = await connectDb();
    const result = await db.collection('counters').findOneAndUpdate(
      { name: 'arbeidsbeperkten' },
      { $inc: { count: 1 } },
      { returnDocument: 'after', upsert: true }
    );
    return result.value;
  } catch (err) {
    throw new Error(`Failed to increment counter: ${err.message}`);
  }
}

async function getCounter() {
  try {
    const db = await connectDb();
    const result = await db.collection('counters').findOne({ name: 'arbeidsbeperkten' });
    return result || { count: 0 };
  } catch (err) {
    throw new Error(`Failed to retrieve counter: ${err.message}`);
  }
}

async function submitBedrijvenFormulier(data) {
  try {
    const db = await connectDb();
    const result = await db.collection('bedrijven_formulieren').insertOne(data);
    return result;
  } catch (err) {
    throw new Error(`Failed to submit bedrijven formulier: ${err.message}`);
  }
}

async function submitArbeidsbeperktFormulier(data) {
  try {
    const db = await connectDb();
    const result = await db.collection('arbeidsbeperkt_formulieren').insertOne(data);
    return result;
  } catch (err) {
    throw new Error(`Failed to submit arbeidsbeperkt formulier: ${err.message}`);
  }
}

async function getFormulierenCount() {
  try {
    const db = await connectDb();
    const count = await db.collection('arbeidsbeperkt_formulieren').countDocuments();
    return count;
  } catch (err) {
    throw new Error(`Failed to get documenten count: ${err.message}`);
  }
}

async function getBedrijven() {
  try {
    const db = await connectDb(); // Connect to the database
    const bedrijvenCollection = db.collection('bedrijven_formulieren'); // Access the collection
    
    // Fetch all documents and convert to array
    const bedrijven = await bedrijvenCollection.find().toArray(); 
    
    return bedrijven; // Return the array of documents
  } catch (err) {
    throw new Error(`Failed to get bedrijven: ${err.message}`);
  }
}

// New functions for wachtlijst formulieren

async function addToWachtlijst(data) {
  try {
    const db = await connectDb();
    const result = await db.collection('wachtlijst_formulieren').insertOne(data);
    return result;
  } catch (err) {
    throw new Error(`Failed to add to wachtlijst: ${err.message}`);
  }
}

async function getWachtlijstFormulieren() {
  try {
    const db = await connectDb();
    const wachtlijstFormulieren = await db.collection('wachtlijst_formulieren').find().toArray();
    return wachtlijstFormulieren;
  } catch (err) {
    throw new Error(`Failed to get wachtlijst formulieren: ${err.message}`);
  }
}

const ObjectId = require('mongodb').ObjectId;

async function acceptFormulier(id) {
  const db = await connectDb();
  const wachtlijstCollection = db.collection('wachtlijst_formulieren');
  const bedrijvenCollection = db.collection('bedrijven_formulieren');


  // Move the formulier from wachtlijst to the main collection (e.g., bedrijven_formulieren)
  // console.log(id)
  const wachtlijstToBedrijven = await wachtlijstCollection.findOne({ _id: new ObjectId(id) }).then((result) => {
    // console.log(result)
    bedrijvenCollection.insertOne(result, { _id: id})
  })
  console.log(wachtlijstToBedrijven)
  const objectId = new ObjectId(id);
  const formulier = await wachtlijstCollection.findOneAndDelete({ _id: objectId });


  return formulier.value;
}


async function denyFormulier(id) {
  try {
    const db = await connectDb();
    const result = await db.collection('wachtlijst_formulieren').findOneAndDelete({ _id: new ObjectId(id) }).then((result) => {
      console.log('test'+result)  
    })
    
    return result;
  } catch (err) {
    throw new Error(`Failed to deny formulier: ${err.message}`);
  }
}

async function closeConnection() {
  try {
    await client.close();
    console.log('MongoDB connection closed.');
  } catch (err) {
    console.error('Failed to close MongoDB connection', err);
    throw err;
  }
}

async function logUserLogin(userId) {
  try {
    const db = await connectDb();
    const loginEvent = {
      userId: userId,
      loginTime: new Date(),
      // You can add more fields like ipAddress, userAgent, etc.
    };
    const result = await db.collection('login_events').insertOne(loginEvent);
    return result;
  } catch (err) {
    throw new Error(`Failed to log user login: ${err.message}`);
  }
}


async function toggleFavorite(userId, entryId) {
  const db = await connectDb();

  // Check if the user already has a favorites document
  const existingFavorite = await db.collection("favorites").findOne({ userId: userId });

  if (existingFavorite) {
    // Check if the entryId is already in the entryIds array
    const entryIndex = existingFavorite.entryIds.indexOf(entryId);

    if (entryIndex !== -1) {
      // If it exists, remove it (untoggle)
      await db.collection("favorites").updateOne(
        { _id: existingFavorite._id },
        { $pull: { entryIds: entryId } }
      );

      // If the array is now empty, you might want to remove the entire document
      // await db.collection("favorites").deleteOne({ _id: existingFavorite._id });

      return { message: 'Favorite removed' };
    } else {
      // If it doesn't exist, add it (toggle)
      await db.collection("favorites").updateOne(
        { _id: existingFavorite._id },
        { $push: { entryIds: entryId } }
      );
      return { message: 'Favorite added' };
    }
  } else {
    // If no document exists for this user, create one with the entryId in the entryIds array
    await db.collection("favorites").insertOne({
      userId: userId,
      entryIds: [entryId],
    });
    return { message: 'Favorite added' };
  }
}


async function getUserFavorites(userId) {
  console.log("req:"+userId)
  const db = await connectDb();


  // const { userId } = userId;

  try {
    const favorite = await db.collection('favorites').findOne({ userId: userId });
    console.log(favorite)
    // if (favorite) {
      // Only return the necessary fields, avoiding potential circular references
      return favorite
  // } 
} catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



module.exports = { 
  incrementCounter, 
  getCounter, 
  submitBedrijvenFormulier, 
  submitArbeidsbeperktFormulier, 
  getFormulierenCount,
  getBedrijven,
  addToWachtlijst,
  getWachtlijstFormulieren,
  acceptFormulier,
  denyFormulier,
  closeConnection,
  logUserLogin,
  toggleFavorite,
  getUserFavorites,
};
