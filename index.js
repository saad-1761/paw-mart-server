const express = require("express");
const { ObjectId } = require("mongodb");
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

    // Fetch single product by ID
    app.get("/listings/:id", async (req, res) => {
      try {
        const id = req.params.id;
        console.log("Fetching product with ID:", id, typeof id);
        const product = await listingCollection.findOne({
          _id: new ObjectId(id),
        });
        console.log("Fetched product:", product);

        if (!product) {
          return res.status(404).json({ message: "Product not found" });
        }

        res.send(product);
      } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ message: "Server error" });
      }
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

    // 🟨 ADD LISTING API (POST)
    app.post("/add-listing", async (req, res) => {
      try {
        console.log("Received new listing data:", req.body);
        const { name, category, description, image, location, email, Price } =
          req.body;

        // 🕒 Auto-generate current date (YYYY-MM-DD)
        const date = new Date().toISOString().split("T")[0];

        // 🧩 Create new listing object
        const newListing = {
          name,
          category,
          Price,
          location,
          description,
          image,
          email,
          date,
        };

        const result = await listingCollection.insertOne(newListing);

        res.send({
          message: "Listing added successfully!",
          insertedId: result.insertedId,
        });
        // res.status(201).json({
        //   message: "Listing added successfully!",
        //   insertedId: result.insertedId,
        // });
      } catch (error) {
        console.error("Error adding listing:", error);
        res.status(500).json({ message: "Failed to add listing" });
      }
    });

    // Fetch listings by user email
    app.get("/my-listings/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const userListings = await listingCollection.find({ email }).toArray();

        if (!userListings.length) {
          return res
            .status(404)
            .json({ message: "No listings found for this user" });
        }

        res.status(200).json(userListings);
      } catch (error) {
        console.error("Error fetching user's listings:", error);
        res.status(500).json({ message: "Server error" });
      }
    });

    // Update listing by ID
    app.put("/listing/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const updateData = { ...req.body };

        // Remove _id if present in request body
        delete updateData._id;

        // Update the date to current
        updateData.date = new Date().toLocaleDateString();

        const result = await listingCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );

        if (result.modifiedCount === 0) {
          return res
            .status(404)
            .json({ message: "Listing not found or no changes made" });
        }

        res.json({ message: "Listing updated successfully" });
      } catch (error) {
        console.error("Error updating listing:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    });

    // ✅ Post new order
    app.post("/orders", async (req, res) => {
      try {
        const orderData = req.body;

        if (!orderData.productId || !orderData.buyerEmail) {
          return res.status(400).json({ message: "Invalid order data" });
        }

        const result = await orderCollection.insertOne(orderData);
        res.status(201).json({
          message: "Order placed successfully",
          insertedId: result.insertedId,
        });
      } catch (error) {
        console.error("Error placing order:", error);
        res.status(500).json({ message: "Server error" });
      }
    });

    // GET orders for a specific buyer (by email)
    app.get("/my-orders/:email", async (req, res) => {
      try {
        const email = req.params.email;
        if (!email) return res.status(400).json({ message: "Email required" });

        const orders = await orderCollection
          .find({ buyerEmail: email })
          .sort({ date: -1 }) // newest first (if date stored sortable)
          .toArray();

        res.status(200).json(orders);
      } catch (error) {
        console.error("Error fetching user orders:", error);
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
