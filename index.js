require("dotenv").config();

const { config } = require("dotenv");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const User = require("./Users");
const PORT = process.env.PORT || 4000;

// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => {
//     app.listen(PORT, () =>
//       console.log(`Listening on port: http://localhost:${PORT}`)
//     );
//   })
//   .catch((error) => {
//     console.log(error);
//   });

mongoose.connect("mongodb://localhost/pagination", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.once("open", async () => {
  if ((await User.countDocuments().exec()) > 0) return;

  Promise.all([
    User.create({ name: "User1" }),
    User.create({ name: "User2" }),
    User.create({ name: "User3" }),
    User.create({ name: "User4" }),
    User.create({ name: "User5" }),
    User.create({ name: "User6" }),
    User.create({ name: "User7" }),
    User.create({ name: "User8" }),
    User.create({ name: "User9" }),
    User.create({ name: "User10" }),
    User.create({ name: "User11" }),
    User.create({ name: "User12" }),
    User.create({ name: "User13" }),
  ]).then(() => console.log("Added Users"));
});

app.get("/users", paginatedResults(User), (req, res) => {
  res.json(res.paginatedResults);
});

function paginatedResults(model) {
  return async (req, res, next) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = {};

    // if (endIndex < model.length) {
    if (endIndex < (await model.countDocuments().exec())) {
      results.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit,
      };
    }

    try {
      results.results = await model.find().limit(limit).skip(startIndex).exec();
      res.paginatedResults = results;
      next();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }

    next();
    // results.results = model.slice(startIndex, endIndex);
  };
}

app.listen(PORT);
