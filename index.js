const express = require('express');
require('dotenv').config()
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
// middlewere

const corsOption = {
    origin: ['http://localhost:5173'], 
    Credential: true, 
}



app.use(cors())
app.use(express.json())

app.get('/', (req, res)=>{
    res.send('study buddy server is running')
})

app.listen(port, ()=>{
    console.log(`study buddy server is running on port : ${port}`);
})