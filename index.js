const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

const port = process.env.PORT || 5000;

//middleware
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

        //Getting services using search query
        app.get("/services", async (req, res) => {
            const query = {}; //Optimization needed
            const cursor = servicesCollection.find(query);
            const services = await cursor.toArray();
            if (req.query.name) {
                const searchText = req.query.name.toLowerCase();
                const filteredServices = services.filter(service => service.name.toLowerCase().includes(searchText));
                res.send(filteredServices);
            }
            else {
                res.send(services);
            }

        });

        //Getting a single service using id parameter
        app.get("/service/:id", async (req, res) => {
            const serviceId = req.params.id;
            console.log(serviceId);
            const query = { _id: ObjectId(serviceId) };
            const service = await servicesCollection.findOne(query);
            res.send(service);
        });
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
