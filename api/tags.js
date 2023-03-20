const express = require("express")

const { getPostsByTagName } = require("../db")

tagsRouter.get("/:tagName/posts", async (req, res, next) => {
    const { tagName } = req.params;
    try {
        req.params = await getPostsByTagName(tagName)
        next({
            name: "CannotAccessTag",
            message: "Cannot access tag"
        })
    } catch ({ name, message }) {
        next ({name, message})
    }
})

module.exports = {
    tagsRouter
}



