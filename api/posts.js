const express = require("express")
const { getAllPosts, createPost, updatePost, getPostById } = require("../db")
const { requireUser } = require("./utils");


const postsRouter = express.Router()

postsRouter.use((req, res, next) => {
    console.log("A request is being made to /posts")

    res.send({ message: "hello from /posts"})
})



postsRouter.get("/", async (req, res) => {
    const posts = await getAllPosts()

    res.send({
        posts
    })

})

postsRouter.post("/", requireUser, async (req, res, next) => {
    res.send({ message: "under construction" })
    const { title, content, tags = "" } = req.body;

    const tagsARR = tags.trim().split(/\s+/)
    const postData = {};

    if (tagsARR.length) {
        postData.tags = tagArr;
    }

    try {
        let postData = {
            "authorId": user,
            title: title,
            content: content,
            tags: tagsARR 
        }
        const post = await createPost(postData);
        res.send({ post });

    } catch ({ name, message }) {
        next({ name, message });
    }
})

postsRouter.patch("/postId", requireUser, async (req, res, next) => {
    const { postId } = req.params;
    const { title, content, tags } = req.body;

    const updateFields = {};

    if (tags && tags.length > 0) {
        updateFields.tags = tags.trim().split(/\s+/);
    }

    if (title) {
        updateFields.title = title;
    }

    if (content) {
        updateFields.content = content;
    }

    try {
        const originalPost = await getPostById(postId);

        if (originalPost.author.id === req.user.id) {
            const updatedPost = await updatePost(postId, updateFields);
            res.send({ post: updatedPost })
        } else {
            next({
                name: "UnauthorizedUserError",
                message: "You cannot update a post that is not yours"
            })
        }
    } catch ({ name, message }) {
        next({ name, message });
    }
})
postsRouter.delete("/:postId", requireUser, async (req, res, next) => {
    try {
        const post = await getPostById(req.params.postId);

        if (post && post.author.id === req.user.id) {
            const updatedPost = await updatePost(post.id, { active: false });

            res.send({ post: updatedPost });
        } else {
            next(post ? {
                name: "UnauthorizeUserError",
                message: "You cannot delete a post which is not yours"
            } : {
                name: "PostNotFoundError",
                message: "That post does not exist"
            }) 
        }
        
    } catch ({ name, message }) {
        next ({ name, message })
    }
})
postsRouter.get("/", async (req, res, next) => {
    try {
        const allPosts = await getAllPosts();

        const posts = allPosts.filter( post => {
            if (post.active) {
                return true;
            }

            if (req.user && post.author.id === req.user.id) {
                return true;
            }

            return false;
        });
        res.send({
            posts
        });
    } catch ({ name, message }) {
        next ({ name, message })
    }
})

module.exports = {
    postsRouter
}