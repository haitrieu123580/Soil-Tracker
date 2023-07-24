const route = require("express").Router();
const db = require('../firebase/db')
const admin = require("firebase-admin");
const productRef = db.collection("product");

// route.get('/fake-data', async (req, res)=>{
//       // Loop to create 10 documents
//   for (let i = 1; i <= 10; i++) {
//     // Replace the following properties with the actual data you want to add to each document
//     const data = {
//         name: `pesticides ${i}`,
//         type: 'thuoc-tru-sau',
//         description: `bla bla bla`,
//         price: i*100
//     };
//     await productRef.doc().set(data);
//   }
//   return res.json({message: 'created'})
// })
route.get('', async (req, res) => {
    try {
        const soilref = await db.collection("product");
        const response = await soilref.get();
        let responseArr = [];
        response.forEach((doc) => {
            responseArr.push(doc.data());
        });
        return res.status(200).json({ data: responseArr })
    } catch (error) {
        return res.json({ message: 'et o et' })
    }
})
route.get('/:productId', async (req, res)=>{
    
})
module.exports = route;