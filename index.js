const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors())
app.use(express.json());


console.log(process.env.DB_PASS)
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hnoajvf.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const roomsCollection = client.db('hotelBooking').collection('Rooms');
        const bookCollection = client.db('bookedRoom').collection('Booked');

        // auth related api
        app.post('/jwt', logger, async (req, res) => {
            const user = req.body;
            console.log(user);
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1h'
            });
            res.send(token)
        })
        // get room data
        app.get('/rooms', async (req, res) => {
            const cursor = roomsCollection.find()
            const result = await cursor.toArray();
            res.send(result)
        })

        // get one data from database
        app.get("/rooms/:id", async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const query = { _id: new ObjectId(id) }
            const result = await roomsCollection.findOne(query)
            res.send(result)
        })

        app.post("/booked", async (req, res) => {
            const newBooked = req.body;
            console.log(newBooked)
            // database e send
            const result = await bookCollection.insertOne(newBooked)
            res.send(result)
        })

        // get booking data
        app.get('/booked', async (req, res) => {
            let query = {}
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const cursor = bookCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })

        app.get("/booked/:id", async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const query = { _id: new ObjectId(id) }
            const result = await bookCollection.findOne(query)
            res.send(result)
        })

        app.delete('/booked/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await bookCollection.deleteOne(query);
            res.send(result);
        })

        app.put("/booked/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updateBook = req.body;
            const product = {
                $set: {
                    checkIn: updateBook.checkIn,
                    checkOut: updateBook.checkOut,
                }
            }
            const result = await bookCollection.updateOne(filter, product, options);
            res.send(result)
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



// EXPRESS
app.get('/', (req, res) => {
    res.send('Hotel is booking')
})
app.listen(port, () => {
    console.log(`Hotel booking server is running on port ${port}`)
})