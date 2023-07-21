require('dotenv').config();

const express = require('express')
const app = express()

const admin = require('firebase-admin')
const credentials = require('./firebase/key.json')

admin.initializeApp({
    credential:admin.credential.cert(credentials)
});
const db = admin.firestore();
app.use(express.json())
app.use(express.urlencoded({extended:true}))

const soilRouter = require('./router/soil');
const productRouter = require('./router/product')
app.use('/api/soil/', soilRouter);
app.use('/api/product/', productRouter);

const port = process.env.PORT || 5000;
app.listen(port, () =>{
    console.log(`server is listening on ${port}`);
})