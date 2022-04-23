const express = require("express");
const cors = require("cors");
const app = express();

const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello from Genius Car Service Server");
});

//listening
app.listen(port, () => {
    console.log("listening from port:", port);
});
