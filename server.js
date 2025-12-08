require("dotenv").config();
const jwt = require("jsonwebtoken")
const sanitizaHTML = require("sanitize-html")
const bcrypt = require('bcrypt')
const cookieParser = require("cookie-parser")
const express = require('express')
const db = require("better-sqlite3")("ourApp.db");
db.pragma("journal_mode = WAL")

//database setupmain
const createTables = db.transaction(()=>{
    db.prepare(
        `
        CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username STRING NOT NULL UNIQUE,
        password STRING NOT NULL UNIQUE
    )
    `
    ).run()

    db.prepare(`
    CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        attemptName TEXT,
        algorithmName TEXT,
        numValues INTEGER,
        authorid INTEGER,
        createdDate TEXT,
        FOREIGN KEY (authorid) REFERENCES users (id)
    )
    `).run()

})

createTables()
//database setup end

const app = express()

app.set("view engine","ejs")
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"))
app.use(cookieParser())
app.use(express.json())


app.use(function (req,res,next) {
    res.locals.errors = []
    //try to decode incoming cookie
    try{
        const decoded = jwt.verify(req.cookies.ourSimpleApp,process.env.JWTSECRET)
        req.user = decoded
    } catch (err){
        req.user = false
    }

    res.locals.user = req.user
    console.log(req.user)

    next()
})

app.get("/", (req, res)=>{
    res.render("homepage")
})

app.get("/algorithms",(req,res)=>{
    res.render("algorithms")
})

app.get("/login", (req, res)=>{
    res.render("login")
})

app.get("/signup",(req,res)=>{
    res.render("signup.ejs")
})

app.get("/dashboard",mustBeLoggedIn, (req,res)=>{
    const postStatement = db.prepare("SELECT * FROM posts WHERE authorid = ?")
    const posts = postStatement.all(req.user.userid)
    res.render("dashboard.ejs", {posts})
})

app.get("/logout",(req,res)=>{
    res.clearCookie("ourSimpleApp")
    res.redirect("/")
})

app.post("/login",(req,res)=>{
    let errors = []

    if (typeof req.body.username !== "string") req.body.username = ""
    if (typeof req.body.password !== "string") req.body.password = ""

    if (req.body.username.trim() === "") errors = ["Username / Password required"]
    if (req.body.password === "") errors = ["Username / Password required"]

    if (errors.length) {
        return res.render("login",{errors})
    }

    const userInQuestionStatement = db.prepare("SELECT * FROM users WHERE USERNAME = ?")
    const userInQuestion = userInQuestionStatement.get(req.body.username)

    if(!userInQuestion){
        errors = ["Invalid Username / Password"]
        return res.render("login", {errors})
    }

    const matchOrNot = bcrypt.compareSync(req.body.password, userInQuestion.password)
    if(!matchOrNot){
        errors = ["Invalid Username / Password"]
        return res.render("login", {errors})
    }

    const ourTokenValue = jwt.sign({exp: Math.floor(Date.now()/1000) + 60 * 60 * 24, skyColor: "blue", userid: userInQuestion.id, username: userInQuestion.username},process.env.JWTSECRET)

    res.cookie("ourSimpleApp",ourTokenValue,{
        httpOnly:true,
        secure:true,
        sameSite:"strict",
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    })

    res.redirect("/")
})

function mustBeLoggedIn(req,res, next){
    if (req.user){
        return next()
    }
    return res.redirect("/")
}

function sharedPostValidation(req){
    const errors = []

    req.body.attemptName = sanitizaHTML(req.body.attemptName.trim(), {allowedTags: [], allowedAttributes: {}})

    return errors;
}

app.post("/post", (req, res)=>{
    const {attemptName, numValues, algorithm} = req.body

    const n = parseInt(numValues)

    const randomArray = [];
    for(let i =0; i < n; i++){
        randomArray.push(Math.floor(Math.random()*30000001)) // up to 3 million numbers
    }

    let sortedArray;
    switch (algorithm){
        case "Sequential Sort":
            sortedArray = randomArray;
            break;
        case "Binary Sort":
            sortedArray = randomArray;
            break;
        case "Insertion Sort":
            sortedArray = randomArray;
            break;
        case "Merge Sort":
            sortedArray = randomArray;
            break;
        case "Quick Sort":
            sortedArray = randomArray;
            break;
        case "Heap Sort":
            sortedArray = randomArray;
            break;
        case "Sequential Search":
            sortedArray = randomArray;
            break;
        case "Binary Search":
            sortedArray = randomArray;
            break;
        default:
            sortedArray = randomArray;
    }

    const newPost = {
        id: posts.length + 1,
        attemptName,
        numValues: n,
        algorithm,
        original: randomArray,
        sorted: sortedArray
    };

    posts.push(newPost);

    res.redirect(`/post/${newPost.id}`);

})

app.get("/post/:id", (req, res)=>{
    const statement = db.prepare("SELECT posts.*, users.username FROM posts INNER JOIN users ON posts.authorid = users.id WHERE posts.id = ?")
    const post = statement.get(req.params.id)

    if (!post){
        return res.redirect("/")
    }

    res.render("single-post", {post})
})

app.post("/run-algorithm", mustBeLoggedIn, (req,res)=>{
    console.log("=== RUN ALGORITHM REQUEST ===");
    console.log("Request body:", req.body);

    const {algorithmName, attemptName, numValues} = req.body

    const userExists = db.prepare("SELECT id FROM users WHERE id = ?").get(req.user?.userid);
    if (!userExists) {
        console.error("Tried to insert post but user not found:", req.user);
        return res.status(400).send({ error: "Invalid user" });
    }

    const ourStatement = db.prepare("INSERT INTO posts (attemptName, algorithmName,numValues, authorid, createdDate ) VALUES (?,?,?,?,?)")
    const result = ourStatement.run(
        attemptName, algorithmName, numValues, req.user.userid, new Date().toISOString())

    const getPostStatement = db.prepare("SELECT * FROM posts WHERE ID = ?")
    const realPost = getPostStatement.get(result.lastInsertRowid)

    return res.json({ redirect: `/post/${realPost.id}` })
})

app.post("/register",(req,res)=>{
    const errors = []

    if (typeof req.body.username !== "string") req.body.username = ""
    if (typeof req.body.password !== "string") req.body.password = ""

    req.body.username = req.body.username.trim()

    if (!req.body.username) errors.push("You must provide a username.")
    if (req.body.username && req.body.username.length < 3) errors.push("Username cannot be less than 3 characters.")
    if (req.body.username && req.body.username.length > 10) errors.push("Username cannot exceed than 10 characters.")
    if (req.body.username && !req.body.username.match(/^[a-zA-Z0-9]+$/)) errors.push("Username can only contain letters and numbers.")

    const usernameStatement = db.prepare("SELECT * FROM users WHERE USERNAME = ?")
    const usernameCheck= usernameStatement.get(req.body.username)
    if(usernameCheck) errors.push("Username is already taken")

    if (!req.body.password) errors.push("You must provide a password.")
    if (req.body.password && req.body.password.length < 8) errors.push("Password cannot be less than 8 characters.")
    if (req.body.password && req.body.password.length > 50) errors.push("Password cannot exceed than 50 characters.")

    if(errors.length){
       return res.render("signup",{errors})
    }

    // save the new user into database
    const salt = bcrypt.genSaltSync(10);
    req.body.password = bcrypt.hashSync(req.body.password, salt);

    const ourStatement = db.prepare("INSERT INTO users (username, password) VALUES (?,?)")
    const result = ourStatement.run(req.body.username, req.body.password)

    const lookupStatement = db.prepare("SELECT * FROM users WHERE ROWID = ?;");
    const ourUser = lookupStatement.get(result.lastInsertRowid)

    //log the user in by giving them a cookie
    const ourTokenValue = jwt.sign({exp: Math.floor(Date.now()/1000) + 60 * 60 * 24, skyColor: "blue", userid: ourUser.id, username: ourUser.username},process.env.JWTSECRET)

    res.cookie("ourSimpleApp",ourTokenValue,{
        httpOnly:true,
        secure:true,
        sameSite:"strict",
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    })

    res.redirect("/")
})



app.listen(3000)