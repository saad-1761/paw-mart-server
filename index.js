const express = require("express");
const cors = require("cors");
const e = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

//pawMartDbUser
//XcKWT2EbCndEmrWS

const uri =
  "mongodb+srv://pawMartDbUser:XcKWT2EbCndEmrWS@cluster0.ddutyub.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const db = client.db("pawMart-db");
    const listingCollection = db.collection("my-listings");
    const orderCollection = db.collection("orders");

    app.get("/listings", async (req, res) => {
      const cursor = listingCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/orders", async (req, res) => {
      const cursor = orderCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // latest data
    app.get("/latest-listings", async (req, res) => {
      const result = await listingCollection
        .find()
        .sort({ date: "desc" })
        .limit(6)
        .toArray();
      res.send(result);
    });

    // Fetch data by category
    app.get("/category/:categoryName", async (req, res) => {
      try {
        const categoryName = req.params.categoryName;
        // const collection = db.collection("products"); // collection name
        const products = await listingCollection
          .find({ category: { $regex: new RegExp(categoryName, "i") } })
          .toArray();

        if (products.length === 0) {
          return res.status(404).json({ message: "No products found" });
        }

        res.json(products);
      } catch (error) {
        console.error("Error fetching category data:", error);
        res.status(500).json({ message: "Server error" });
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome back again");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
