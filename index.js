const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

const port = process.env.PORT || 5000;

//Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hxosy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});

async function run() {
    try {
        await client.connect();
        const servicesCollection = client.db("geniusCarDB").collection("services");

        //////////////////////////////////
        // Find Operations
        //////////////////////////////////

        //Getting services using search query
        app.get("/services", async (req, res) => {
            const query = {}; //Optimization needed
            const cursor = servicesCollection.find(query);
            const services = await cursor.toArray();
            if (req.query.name) {
                const searchText = req.query.name.toLowerCase();
                const filteredServices = services.filter((service) =>
                    service.name.toLowerCase().includes(searchText)
                );
                res.send(filteredServices);
            } else {
                res.send(services);
            }
        });

        //Getting a single service using id parameter
        app.get("/service/:id", async (req, res) => {
            const serviceId = req.params.id;
            const query = { _id: ObjectId(serviceId) };
            const service = await servicesCollection.findOne(query);
            res.send(service);
        });

        //////////////////////////////////
        // Insert Operations
        //////////////////////////////////

        //Adding a service
        app.post("/service", async (req, res) => {
            const newService = req.body;
            const result = await servicesCollection.insertOne(newService);
            res.send(result); // will return insertedId
        });

        //Adding multiple service
        app.post("/services", async (req, res) => {
            const newService = req.body;
            const result = await servicesCollection.insertMany(newService);
            res.send(result); //will return insertedCount, insertedIds
        });

        //////////////////////////////////
        // Update Operations
        //////////////////////////////////

        //Updating a service
        app.put("/service/:id", async (req, res) => {
            const serviceId = req.params.id;
            const filter = { _id: ObjectId(serviceId) }; //Finding existing service using id

            //formatting updated service
            const updatedService = req.body;
            const updateDoc = {
                $set: {
                    ...updatedService,
                },
            };

            const options = { upsert: true }; //update option (update/insert)

            const result = await servicesCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });

        //////////////////////////////////
        // Delete Operations
        //////////////////////////////////

        //Deleting a service
        app.delete("/service/:id", async (req, res) => {
            const serviceId = req.params.id;
            const query = { _id: ObjectId(serviceId) };
            const result = await servicesCollection.deleteOne(query);
            res.send(result);
        });
        //
    } finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("Hello from Genius Car Service Server");
});

//listening
app.listen(port, () => {
    console.log("listening from port:", port);
});
