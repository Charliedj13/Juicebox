const express = require("express");
const app = express();
require('dotenv').config();
console.log(process.env.JWT_SECRET)
const PORT = 3008;

const morgan = require("morgan");
app.use(morgan("dev"));

app.use(express.json())

//POST: /api/users/register
//POST /api/users/login
//DELETE: /api/users/:id

//GET: /api/posts
//POST /api/posts
//PATCH: /api/posts/:id
//DELETE: /api/posts/:id

//GET /api/tags
//GET /api/tags/:tagName/posts



const { apiRouter } = require("./api");
const { client } = require("./db");
app.use("/api", apiRouter)

app.get("/background/:color", (req, res, next) => {
    res.send(`
    <body style="background: ${ req.params.color };">
    <h1>Hello World</h1>
    </body>
    `);
});

client.connect();


app.listen(PORT, () => {
    console.log("The server is up on port 3000")
})


