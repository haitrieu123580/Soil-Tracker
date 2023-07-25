require('dotenv').config();
const cors = require('cors');
const express = require('express')
const app = express()
// Cấu hình CORS cho phép truy cập từ nguồn gốc khác
app.use(cors());

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const soilRouter = require('./router/soil');
const productRouter = require('./router/product')
app.use('/api/soil', soilRouter);
app.use('/api/product/', productRouter);

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`server is listening on ${port}`);
})