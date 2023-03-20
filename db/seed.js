//

const { 
    client,
    createUser,
    updateUser,
    getAllUsers,
    getUserById,
    // getPostsByUser,
    createPost,
    updatePost,
    getAllPosts,
    getPostsByUser,
    createTags,
    createPostTag,
    addTagsToPost,
    getPostById,
    getPostsByTagName,
    getAllTags
} = require("./index");

async function dropTables() {
    try {
        console.log("Starting to drop tables...")

        await client.query(`
        DROP TABLE IF EXISTS post_tags;
        DROP TABLE IF EXISTS tags;
        DROP TABLE IF EXISTS posts;
        DROP TABLE IF EXISTS users;
        `);

        console.log("Finished dropping tables!");

    } catch (error){
        console.log("Error Dropping Tables")
        throw error;
    }
}

async function createTables() {
    try {
        console.log("Starting to build tables");

        await client.query(`
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            username varchar(255) UNIQUE NOT NULL,
            password varchar(255) NOT NULL,
            name varchar(255) NOT NULL,
            location varchar(255) NOT NULL,
            active boolean DEFAULT true
        );
        CREATE TABLE posts (
            id SERIAL PRIMARY KEY,
            "authorId" INTEGER REFERENCES users(id),
            title varchar(255) NOT NULL,
            content TEXT NOT NULL,
            active BOOLEAN DEFAULT true
        );
        CREATE TABLE tags (
            id SERIAL PRIMARY KEY,
            name varchar(255) UNIQUE NOT NULL
        );
        CREATE TABLE post_tags (
            "postId" INTEGER REFERENCES posts(id),
            "tagId" INTEGER REFERENCES tags(id),
            UNIQUE ("postId", "tagId")
        );
        `);

        console.log("Finished building tables")
    } catch (error) {
        console.log("Error Building Tables")
    }
}

async function createInitialUsers() {
    try {
        console.log("Starting to create users...")

        await createUser({ 
            username: "albert", 
            password: "bertie99", 
            name: "Al Bert",
            location: "Sidney, Australia"
        });
        await createUser({ 
            username: "sandra", 
            password: "2sandy4me",
            name: "Just Sandra",
            location: "Aint Tellin" 
        });
        await createUser({ 
            username: "glamgal", 
            password: "soglam",
            name: "Joshua",
            location: "Upper East Side" 
        });
        // const albert = createUser({ username: "albert", password: "bertie99" });
        

        // console.log(albert)

        console.log("Finished creating users")

    } catch (error) {
        console.log("Error creating users")
        console.log(error)
    }
}

async function createInitialPosts() {
    try {
        const [albert, sandra, glamgal] = await getAllUsers();

        console.log("Starting to create posts...");
        await createPost({
            authorId: albert.id,
            title: "First Post",
            content: "This is my first post. I hope I love writing blogs as much as I love writing them",
            tags: ["#happy", "#youcandoanything"]
        });

        await createPost({
            authorId: sandra.id,
            title: "how does this work",
            content: "Seriouly, does this even do anything",
            tags: ["#happy", "#worst-day-ever"]
        })

        await createPost({
            authorId: glamgal.id,
            title: "Living the Glam Life",
            content: "Do you even? I swear that half of you are posing.",
            tags: ["#happy", "#youcandoanything", "#canmandoeverything"]
        });
        console.log("Finished creating posts...")


    } catch (error) {
        console.log("Error creating posts")
    }
}

async function createInitialTags() {
    try {
        console.log("Starting to create tags...");

        const [happy, sad, inspo, catman] = await createTags([
            "#happy",
            "#worst-day-ever",
            "#youcandoanything",
            "#catmandoeverything"
        ]);

        const [postOne, postTwo, postThree] = await getAllPosts();

        console.log("Starting to add tags to post")
        await addTagsToPost(postOne.id, [happy, inspo]);
        await addTagsToPost(postTwo.id, [sad, inspo]);
        await addTagsToPost(postThree.id, [happy, catman, inspo]);

        console.log("Finished Creating Tags!");

    } catch (error) {
        console.log(error)
        console.log("Error creating tags!")
    }
}


async function buildDB() {
    // Creating initial database
    try {
        client.connect()

        
    // Have to delete database before recreating it
        await dropTables();
    // Creating the tables
        await createTables();
    // Creating the initial data
        await createInitialUsers();
        await createInitialPosts();
        await createInitialTags();
        
        // const result = await client.query(`Select * FROM users;`)

        
        
    } catch (error) {
        console.log("Error building DB")
    
    }
}

async function testDB() {
    // Testing all databse functions
    try {
        console.log("Starting to test database...");
        
        console.log("Calling getAllUsers");
        const users = await getAllUsers();
        // console.log("getAllUsers:", users);

        console.log("Calling updateUser on users[0]");
        const updateUserResult = await updateUser(users[0].id, {
            name: "Newname Sogood",
            location: "Lesterville, KY"
        });
        // console.log("Result:", updateUserResult)

        console.log("Calling getAllposts");
        const posts = await getAllPosts();
        // console.log("Result", posts);

        console.log("Calling updatePost on posts[0]");
        const updatePostResult = await updatePost(posts[0].id, {
            title: "New Title",
            content: "Updated Content"
        });
        console.log("Result:", updatePostResult);

        const albert = await getUserById(1);
        // console.log("Result:", albert);

        console.log("Calling updatePost on posts[1], only updating tags");
        const updatePostTagsResult = await updatePost(posts[1].id, {
            tags: ["#youcandoanything", "redfish", "#bluefish"]
        });
        // console.log("Result:", updatePostTagsResult);

        console.log("Calling getPostsByTagName with #happy");
        const postsWithHappy = await getPostsByTagName("#happy")
        console.log("Result:", postsWithHappy)

        console.log("Finished database tests")
    } catch (error) {
        console.log("Error testing database")
    }
}


async function rebuildDB () {
    try {

    await buildDB()
    await testDB()
    
    client.end()

    } catch (error) {
        console.log(error)
    }
}
rebuildDB()
