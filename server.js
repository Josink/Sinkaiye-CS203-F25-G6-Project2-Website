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
        createdDate TEXT,
        title STRING NOT NULL,
        body TEXT NOT NULL,
        num INTEGER NOT NULL,
        authorid INTEGER,
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
    res.render("dashboard.ejs")
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

app.post("/run-algorithm", mustBeLoggedIn, (req,res)=>{
    console.log("=== RUN ALGORITHM REQUEST ===");
    console.log("Request body:", req.body);

    const {algorithmName, attemptName, numValues} = req.body

    res.send({
        success: true,
        message: `Algorithm ${algorithmName} started with ${numValues} values`,
        attemptName: attemptName
    })

    const ourStatement = db.prepare("INSERT INTO posts (attemptName, algorithmName, authorid, createdDate ) VALUES (?,?,?,?)")
    const result = ourStatement.run(
        req.body.attemptName, req.body.algorithmName, req.body.numValues,req.body.user.userid, new Date().toISOString())
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