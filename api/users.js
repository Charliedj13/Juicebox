const express = require("express");
const { getAllUsers, getUserByUsername, createUser } = require("../db")

const userRouter = express.Router();

userRouter.use((req, res, next) => {
    console.log("A request is being made to /users");

    next()
});



userRouter.get("/", async (req, res) => {
    const users = await getAllUsers()

    res.send({
        users,
    });

});

userRouter.post("/login", async (req, res, next) => {
    const { username, password } = req.body

    if (!username || !password) {
        next({
            name: "MissingCredentialsError",
            message: "Please supply both a username and a password"
        });
    }

    try {
        const user = await getUserByUsername(username);

        if (user && user.password == password) {
            res.send({ message: "you are now logged in"});
        } else {
            next({
                name: "IncorrectCredentialsError",
                message: "Username or password is incorrect"
            })
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
    console.log(req.body);
    res.end();
})

userRouter.post("/register", async (req, res, next) => {
    const { username, password, name, location } = req.body;

    try {
        const _user = await getUserByUsername(username);

        if (_user) {
            next({
                name: "UserExistsError",
                message: "A user by that username already exists"
            });
        }
        
        const user = await createUser({
            username,
            password,
            name,
            location
        });

        const token = jwt.sign({
            id: user.id,
            username
        }, process.env.JWT_SECRET, {
            expiresIn: "1w"
        })

        res.send({
            message: "thank you for signing up",
            token
        })
    } catch ({ name, message }) {
        next({ name, message })
    }
});

module.exports = {
    userRouter
}