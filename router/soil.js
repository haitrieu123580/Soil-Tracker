const route = require("express").Router();

route.get('', async (req, res) =>{
    return res.json({message: 'ok'})
})
module.exports = route;