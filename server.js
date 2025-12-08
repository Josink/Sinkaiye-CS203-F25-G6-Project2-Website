require("dotenv").config();
const jwt = require("jsonwebtoken");
const sanitizeHTML = require("sanitize-html");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const express = require("express");
const db = require("better-sqlite3")("ourApp.db");
db.pragma("journal_mode = WAL");

// Algorithm helpers
const generateArray = require("./utils/generateArray");

// Sorting algorithms
const SelectionSort = require("./algorithms/SelectionSort");
const BubbleSort = require("./algorithms/BubbleSort");
const InsertionSort = require("./algorithms/InsertionSort");
const MergeSort = require("./algorithms/MergeSort");
const HeapSort = require("./algorithms/HeapSort");
const QuickSort = require("./algorithms/QuickSort");

// Searching algorithms
const SequentialSearch = require("./algorithms/SequentialSearch");
const BinarySearch = require("./algorithms/BinarySearch");

const sortAlgorithms = {
    "Selection Sort": SelectionSort,
    "Bubble Sort": BubbleSort,
    "Insertion Sort": InsertionSort,
    "Merge Sort": MergeSort,
    "Heap Sort": HeapSort,
    "Quick Sort": QuickSort,
};

const searchAlgorithms = {
    "Sequential Search": SequentialSearch,
    "Binary Search": BinarySearch,
};


// -----------------------------
// DATABASE TABLES
// -----------------------------
const createTables = db.transaction(() => {
    db.prepare(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        )
    `).run();

    db.prepare(`
        CREATE TABLE IF NOT EXISTS attempts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            attemptName TEXT NOT NULL,
            algorithmName TEXT NOT NULL,
            numValues INTEGER NOT NULL,
            originalValues TEXT NOT NULL,
            sortedValues TEXT,
            comparisons INTEGER DEFAULT 0,
            swaps INTEGER DEFAULT 0,
            executionTime INTEGER DEFAULT 0,
            searchIndex INTEGER,
            createdDate TEXT NOT NULL,
            FOREIGN KEY (userId) REFERENCES users(id)
        )
    `).run();
});
createTables();


// -----------------------------
// EXPRESS SETUP
// -----------------------------
const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());


// -----------------------------
// AUTH MIDDLEWARE
// -----------------------------
app.use((req, res, next) => {
    try {
        const decoded = jwt.verify(req.cookies.ourSimpleApp, process.env.JWTSECRET);
        req.user = decoded;
    } catch {
        req.user = false;
    }

    res.locals.user = req.user;
    res.locals.errors = [];
    next();
});

function mustBeLoggedIn(req, res, next) {
    if (req.user) return next();
    return res.redirect("/login");
}


// -----------------------------
// BASIC PAGES
// -----------------------------
app.get("/", (req, res) => res.render("homepage"));
app.get("/algorithms", (req, res) => res.render("algorithms"));
app.get("/login", (req, res) => res.render("login"));
app.get("/signup", (req, res) => res.render("signup"));
app.get("/logout", (req, res) => {
    res.clearCookie("ourSimpleApp");
    res.redirect("/");
});


// -----------------------------
// DASHBOARD
// -----------------------------
app.get("/dashboard", mustBeLoggedIn, (req, res) => {
    const stmt = db.prepare("SELECT * FROM attempts WHERE userId = ? ORDER BY id DESC");
    const posts = stmt.all(req.user.userid);

    res.render("dashboard", { posts });
});


// -----------------------------
// LOGIN
// -----------------------------
app.post("/login", (req, res) => {
    let errors = [];

    const { username, password } = req.body;

    if (!username || !password) {
        errors.push("Username and Password required");
        return res.render("login", { errors });
    }

    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);

    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.render("login", { errors: ["Invalid username or password"] });
    }

    const token = jwt.sign(
        {
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
            userid: user.id,
            username: user.username,
        },
        process.env.JWTSECRET
    );

    res.cookie("ourSimpleApp", token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24,
    });

    res.redirect("/");
});


// -----------------------------
// SIGNUP
// -----------------------------
app.post("/register", (req, res) => {
    let errors = [];

    const username = req.body.username?.trim();
    const password = req.body.password;

    if (!username || username.length < 3)
        errors.push("Username must be at least 3 characters");

    if (!password || password.length < 8)
        errors.push("Password must be at least 8 characters");

    if (db.prepare("SELECT * FROM users WHERE username = ?").get(username))
        errors.push("Username already exists");

    if (errors.length) return res.render("signup", { errors });

    const hashed = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

    const result = db
        .prepare("INSERT INTO users (username, password) VALUES (?, ?)")
        .run(username, hashed);

    const token = jwt.sign(
        {
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
            userid: result.lastInsertRowid,
            username,
        },
        process.env.JWTSECRET
    );

    res.cookie("ourSimpleApp", token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24,
    });

    res.redirect("/");
});


// -----------------------------
// VIEW SINGLE POST
// -----------------------------
app.get("/post/:id", mustBeLoggedIn, (req, res) => {
    const stmt = db.prepare(`
        SELECT attempts.*, users.username 
        FROM attempts 
        JOIN users ON attempts.userId = users.id
        WHERE attempts.id = ?
    `);
    const post = stmt.get(req.params.id);

    if (!post) return res.redirect("/dashboard");

    post.originalValues = JSON.parse(post.originalValues);
    post.sortedValues = JSON.parse(post.sortedValues);

    res.render("single-post", { post });
});


// -----------------------------
// RUN ALGORITHM  (FIXED VERSION)
// -----------------------------
app.post("/run-algorithm", mustBeLoggedIn, (req, res) => {
    try {
        const userRow = db.prepare("SELECT id FROM users WHERE id = ?").get(req.user.userid);
        if (!userRow) {
            res.clearCookie("ourSimpleApp");
            return res.redirect("/login");
        }

        const { algorithmName, attemptName, numValues } = req.body;

        const cleanAttempt = sanitizeHTML(attemptName || "", {
            allowedTags: [],
            allowedAttributes: {},
        });

        const count = Number(numValues);
        if (!algorithmName || count <= 0) {
            return res.status(400).send("Invalid input");
        }

        const array = generateArray(count);
        const originalValues = [...array];

        let sortedValues = null;
        let searchIndex = null;
        let results = { comparisons: 0, swaps: 0, executionTime: 0 };

        // Sorting
        const cleanAlgoName = algorithmName.trim().toLowerCase();

        const algoKey = Object.keys(sortAlgorithms).find(
            key => key.toLowerCase() === cleanAlgoName
        );

        if (algoKey) {
            const Algo = sortAlgorithms[algoKey];
            const instance = new Algo(array);
            instance.sort();
            results = instance.getResults();

            sortedValues = instance.values;
        }

        // Searching
        else if (searchAlgorithms[algorithmName]) {
            const Algo = searchAlgorithms[algorithmName];
            const instance = new Algo(array);
            const target = array[array.length - 1];

            searchIndex = instance.search(target);

            results = instance.getResults
                ? instance.getResults(searchIndex)
                : { comparisons: instance.comparisons, executionTime: instance.executionTime };
        }

        const insert = db.prepare(`
            INSERT INTO attempts 
            (userId, attemptName, algorithmName, numValues, originalValues, sortedValues,
             comparisons, swaps, executionTime, searchIndex, createdDate)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const info = insert.run(
            req.user.userid,
            cleanAttempt,
            algorithmName,
            count,
            JSON.stringify(originalValues),
            JSON.stringify(sortedValues),
            results.comparisons || 0,
            results.swaps || 0,
            results.executionTime || 0,
            searchIndex,
            new Date().toISOString()
        );

        res.redirect(`/post/${info.lastInsertRowid}`);
    } catch (err) {
        console.error("run-algorithm error:", err);
        res.status(500).send("Server error");
    }
});


// -----------------------------
// START SERVER
// -----------------------------
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
