const pg = require("pg");

const client = new pg.Client("postgres://localhost:5432/Juicebox")



async function createUser({ username, password, name, location }) {
    try {
const { rows: [ user ] } = await client.query(`
        INSERT INTO users(username, password, name, location)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (username) DO NOTHING
        RETURNING *;
`, [username, password, name, location])

    return user;
    } catch (error) {
        console.log(error)
    }
}

// UPDATE users
// SET "username" = $1 
// "password" = #2
// "name" = $3
// "location" = $4
// `).join(", ");


// async function updateUser(id, fields = {}) {
//     const setString = Object.keys(fields).map(
//         (key, index) => `"${ key }"=$${ index + 1 }`
//     ).joing(', ')
        

//         if (setString.length === 0) {
//             return;
//         }

//         try {
//             const result = await client.query(`
//             UPDATE users
//             SET ${ setString }
//             WHERE  id=${ id }
//             RETURNING *;
//             `, Object.values(fields));

//             return result
//         } catch (error) {
//             console.log(error)
//         }
// }

async function updateUser(id, fields = {}) {
    // build the set string
    const setString = Object.keys(fields).map(
      (key, index) => `"${ key }"=$${ index + 1 }`
    ).join(', ');
  
    // return early if this is called without fields
    if (setString.length === 0) {
      return;
    }
  
    try {
      const { rows: [ user ] } = await client.query(`
        UPDATE users
        SET ${ setString }
        WHERE id=${ id }
        RETURNING *;
      `, Object.values(fields));
  
      return user;
    } catch (error) {
      throw error;
    }
  }


async function getAllUsers() {
    try {
    const { rows } = await client.query(`
    SELECT id, username, name, location, active
    FROM users;
    `);

    return rows;
    } catch (error) {
        console.log(error)
    }
}

async function getUserById(userId) {
    try {
    const { rows: [ user ] } = await client.query(`
    SELECT id, username, name, location, active
    FROM users
    WHERE id=${ userId }
    `);

    if (!user) {
        return null
    }

    user.posts = await getPostsByUser(userId);

    return user

    } catch (error) {
        console.log(error)
    }
}

async function createPost({
    authorId,
    title,
    content,
    tags = []
}) {
    try {
        const { rows: [ post ] } = await client.query(`
        INSERT INTO posts("authorId", title, content)
        VALUES ($1, $2, $3)
        RETURNING *;
        `, [authorId, title, content]);

        const tagList = await createTags(tags);

        return await addTagsToPost(post.id, tagList)

       
    } catch (error) {
        console.log(error)
    }
}

async function updatePost(id, fields = {}) {

    const { tags } = fields;
    delete fields.tags

    // build the set string
    const setString = Object.keys(fields).map(
      (key, index) => `"${ key }"=$${ index + 1 }`
    ).join(', ');
  
    // return early if this is called without fields
    if (setString.length === 0) {
      return;
    }
  
    try {
    if (setString.length > 0) {
        await client.query(`
        UPDATE posts
        SET ${ setString }
        WHERE id=${ postId }
        RETURNING *;
      `, Object.values(fields));
        }
      
        if (tags === undefined) {
            return await getPostById(postId);
        }

        const tagList = await createTags(tags);
        const tagListIdString = tagList.map(
            tag => `${ tag.id }`
        ).join(', ');

        await client.query(`
        DELETE FROM post_tags
        WHERE "tagId"
        NOT IN (${ tagListIdString })
        AND "postId"=$1;
        `, [postId]);

        await addTagsToPost(postId, tagList);

  
      return await getPostById(postId);
    } catch (error) {
      throw error;
    }
  }

// async function updatePost(id, fields = {}) {
//     const setString = Object.keys(fields).map(
//         (key, index) => `"${ key }" =$${ index + 1}`
//     ).join(', ')

//     if (setString.length === 0) {
//         return
//     }

//     try {
//         const { rows: [ post ] } = await client.query(`
//         UPDATE posts
//         SET ${ setString }
//         WHERE id=${ id }
//         RETURNING *;
//         `, Object.values(fields));

//         return post;

//     } catch (error) {
//         console.log(error)
//     }
// }

async function getAllPosts() {
    try {
        const { rows } = await client.query(`
        SELECT id
        FROM posts;
        `);

        const posts = await Promise.all(postIds.map(
            post => getPostById( post.id )
        ));


        return posts;
    } catch (error) {
        console.log(error)
    }
}

async function getPostsByUser(userId) {
    try {
        const { rows: postIds } = await client.query(`
        SELECT id
        FROM posts
        WHERE "authorId"=${ userId };
        `);

        const posts = await Promise.all(postIds.map(
            post => getPostById( post.id )
        ));

        return post
    } catch (error) {
        console.log(error)
    }
}

async function createTags(tagList) {
    if (tagList.length === 0) {
        return
    }

    const insertValues = tagList.map(
        (_, index) => `$${ index + 1 }`).join('), (');
    
        const selectValues = tagList.map(
            (_, index) => `$${ index + 1 }`).join(', ');
        
        try {

        const { rows } = await client.query(`
        INSERT INTO tags(name)
        VALUES ($1, $2, $3)
        ON CONFLICT (name) DO NOTHING
        SELECT * FROM tags
        WHERE name
        IN ($1, $2, $3);
        `);
        

        return rows;
        //     INSERT INTO users(username, password, name, location)
        // VALUES ($1, $2, $3, $4)
        // ON CONFLICT (username) DO NOTHING
        // RETURNING *;

        } catch (error) {
            console.log(error)
        }
}

async function createPostTag(postId, tagId) {
    try {
        await client.query(`
        INSERT INTO post_tags("postId", "tagId")
        VALUES ($1, $2)
        ON CONFLICT ("postId", "tagId") DO NOTHING;
        `, [postId, tagId]);
    } catch (error) {
        console.log(error)
    }
}

async function addTagsToPost(postId, tagList) {
    try {
        const createPostTagPromises = tagList.map(
            tag => createPostTag(postId, tag.id)
        );

        await Promise.all(createPostTagPromises);

        return await getPostById(postId);
        

    } catch (error) {
    console.log(error)
    }
    
}

async function getPostById(postId) {
    try {
        const { rows: [ post ] } = await client.query(`
        SELECT *
        FROM posts
        WHERE id=$1;
        ` [postId]);

        const { rows: tags } = await client.query(`
        SELECT tags.*
        FROM tags
        JOIN post_tags ON tags.id=post_tags."tagId"
        WHERE post_tags."postId"=$1;
        `, [postId])
        
        const { rows: [author] } = await client.query(`
        SELECT id, username, name, location
        FROM USERS
        WHERE id=$1;
        `, [post.authorId])

        post.tags = tags;
        post.author = author

        delete post.authorId

        return post

    } catch (error) {
        console.log(error)
    }
}

async function getPostsByTagName(tagName) {
    try {
        const { rows: postIds } = await client.query(`
        SELECT posts.id
        FROM posts
        JOIN post_tags ON posts.id=post_tags."postId"
        JOIN tags ON tags.id=post_tags."tagId"
        WHERE tags.name=$1;
        `, [tagName]);

        return await Promise.all(postIds.map(
            post => getPostById(post.id)
        ));
    } catch (error) {
        console.log(error)
    }
}



module.exports = {
    client,
    createUser,
    updateUser,
    getAllUsers,
    getUserById,
    getPostsByUser,
    createPost,
    updatePost,
    getAllPosts,
    // getPostsByUser,
    createTags,
    createPostTag,
    addTagsToPost,
    getPostById,
    getPostsByTagName
}

