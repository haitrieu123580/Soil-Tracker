const route = require("express").Router();
const db = require('../firebase/db');
const admin = require("firebase-admin");
const productRef = db.collection("product");

// Seed fake data to the database
// route.get('/fake-data', async (req, res) => {
//   try {
//     // Loop to create 10 documents
//     for (let i = 1; i <= 10; i++) {
//       // Replace the following properties with the actual data you want to add to each document
//       const data = {
//         name: `pesticides ${i}`,
//         type: 'thuoc-tru-sau',
//         description: `bla bla bla`,
//         price: i * 100
//       };
//       await productRef.doc().set(data);
//     }
//     return res.json({ message: 'created' });
//   } catch (error) {
//     return res.status(500).json({ message: 'et o et' });
//   }
// });

// Get all products
route.get('', async (req, res) => {
  try {
    const productsSnapshot = await productRef.get();
    const products = productsSnapshot.docs.map(doc => {
      data.id = doc.id; // Include the 'id' property in the data object
      const data = doc.data();
      return data;
    });

    const fertilizers = products.filter(p => p.type === 'phan-bon');
    const pesticides = products.filter(p => p.type === 'thuoc-tru-sau');

    return res.status(200).json({
      data: {
        fertilizers: fertilizers,
        pesticides: pesticides
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong' });
  }
});

// Get a specific product by productId
route.get('/:productId', async (req, res) => {
  try {
    const productSnapshot = await productRef.doc(req.params.productId).get();

    // Check if the document exists
    if (!productSnapshot.exists) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    const documentData = productSnapshot.data();
    return res.status(200).json({
      data: documentData
    });
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong' });
  }
});

module.exports = route;
