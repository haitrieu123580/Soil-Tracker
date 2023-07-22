const route = require("express").Router();
const db = require('../firebase/db')
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
module.exports = route;