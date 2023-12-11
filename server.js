require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const expireTime = 60 * 60 * 1000;

// Import query and functions
const db_query = require('./database/queries');                         // db used for user queries

const PORT = 3000;
const saltRounds = 12;
const app = express();


const connectDB = async () => {
    try{
        const conn = await mongoose.connect(process.env.MONGO_URL);
        console.log("MongoDB Connected");
    } catch (err){
        console.log(err);
        process.exit(1);
    }
}



// Middleware
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());
app.use(session({
    secret: process.env.NODE_SECRET_SESSION,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URL,
        crypto:{secret: process.env.MONGO_SESSION_SECRET},
        collectionName: "sessions"
    }),
    saveUninitialized: false,
    resave: true,
    cookie: {
        maxAge: expireTime,
        secure: true
    }
}));

const corsOption = {
    origin: '*',
    credentials:true,
    optionSuccessStatus: 200,
};

app.use(cors(corsOption));

app.get('/', (req, res) => {
    res.json({
        message: "SAM AND ALAN CHICKEN SURVIVORS"
    })
})

//API routes

app.post('/login', async (req, res) => {
    const result = await db_query.getUser({username: req.body.username});

    if (result.user === undefined){
        res.json({success: false, message: "There is no user with that username..."})
    }
    
    const userResult = result.user;

    if(userResult.password === req.body.password){
        req.session.authenticated = true;
        req.session.user_id = userResult.user_id;
        req.session.username = userResult.username;
        req.session.email = userResult.email;
        req.session.password = userResult.password;
        let sessionID = req.sessionID;
        req.sessionStore.set(sessionID, req.session);
        res.json({
            success: true,
            sessionID: sessionID
        })
    }else{
        res.json({success: false, message: "The password does not match..."})
    }
    
})

app.post('/signup', async (req, res) => {
    console.log(req.body.username);
    const result = await db_query.createUser({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    });
    console.log(result);
    res.json(result)
})

app.post('/save', async (req, res) => {
    req.sessionStore.get(req.body.session, async(err, session) => {
        if (session.authenticated){
            let result = await db_query.save({
                user_id: session.user_id,
                wave: req.body.wave,
                time: req.body.time,
                exp: req.body.exp,
                health: req.body.health
            })
        }
    })
    res.json();
})

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`APP LISTENING ON PORT: ${PORT}`)
    })
})
