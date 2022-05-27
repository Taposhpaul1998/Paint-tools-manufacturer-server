const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xwtrt.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const productsCollection = client.db('HeroPaintTools').collection('products');
        const ordersCollection = client.db('HeroPaintTools').collection('orders');
        const reviewCollection = client.db('HeroPaintTools').collection('review');

        // server api 
        app.get('/products', async (req, res) => {
            const query = {};
            const cursor = productsCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        });

        app.get('/orders', async (req, res) => {
            const query = {};
            const cursor = ordersCollection.find(query);
            const orders = await cursor.toArray();
            res.send(orders);
        });
        app.get('/review', async (req, res) => {
            const query = {};
            const cursor = reviewCollection.find(query);
            const orders = await cursor.toArray();
            res.send(orders);
        });

        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const products = await productsCollection.findOne(query);
            res.send(products);
        });

        //POST 
        app.post('/orders', async (req, res) => {
            const newOrder = req.body;
            const result = await ordersCollection.insertOne(newOrder);
            res.send(result)
        })
        app.post('/review', async (req, res) => {
            const newOrder = req.body;
            const result = await reviewCollection.insertOne(newOrder);
            res.send(result)
        })
        app.post('/products', async (req, res) => {
            const newOrder = req.body;
            const result = await productsCollection.insertOne(newOrder);
            res.send(result)
        })

        // Delete 
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            res.send(result);
        })

    }
    finally {

    }
};
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Ranning Hero point tools server');
});

app.listen(port, () => {
    console.log('listen port', port);
});
