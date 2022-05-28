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

function verifyJWt(req, res, next) {
    const authHedar = req.headers.authorization;
    if (!authHedar) {
        return res.status(401).send({ message: 'unauthorizd access' })
    }
    const token = authHedar.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decode) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        req.decode = decode;
    })

    next();
}


async function run() {
    try {
        await client.connect();
        const productsCollection = client.db('HeroPaintTools').collection('products');
        const ordersCollection = client.db('HeroPaintTools').collection('orders');
        const reviewCollection = client.db('HeroPaintTools').collection('review');
        const userCollection = client.db('HeroPaintTools').collection('user');


        // server api 
        app.get('/products', async (req, res) => {
            const query = {};
            const cursor = productsCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        });

        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email;
            const user = await userCollection.findOne({ email: email });
            const isAdmin = user.role === 'admin';
            res.send({ admin: isAdmin })
        })

        app.put('/user/admin/:email', verifyJWt, async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const updateDoc = {
                $set: { role: 'admin' },
            };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result);
        })

        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
            res.send({ result, token });
        });

        app.get('/user', verifyJWt, async (req, res) => {
            const users = await userCollection.find().toArray();
            res.send(users);
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
        app.delete('/orders/:id', verifyJWt, async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
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
