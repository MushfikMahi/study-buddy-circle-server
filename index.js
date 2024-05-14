const express = require('express');
require('dotenv').config()
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
// middlewere

const corsOption = {
    origin: ['http://localhost:5173','https://study-buddy-circle.web.app','https://study-buddy-circle.firebaseapp.com'], 
    credentials: true, 
    optionSuccessStatus: 200,
}
app.use(cors(corsOption))
app.use(express.json())
app.use(cookieParser())


const verifyToken = async(req, res, next)=>{
  const token = req.cookies?.token
  if(!token) return res.status(401).send({message: 'unauthorized access'})
      if(token){
        jwt.verify(token,process.env.ACCESS_TOKEN_SECRET, (err, decoded)=>{
          if(err){
            return  res.status(401).send({message: 'unauthorized access'})
          }
          console.log(decoded);
          req.user = decoded
        })
      }
  next()
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.04rw29h.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
  async function run() {
    try {
      // Connect the client to the server	(optional starting in v4.7)
    //   await client.connect();
      // Send a ping to confirm a successful connection
    //   await client.db("admin").command({ ping: 1 });

    const assignmentsCollection = client.db('assignmentsDB').collection('assignments')
    const submittedCollection = client.db('assignmentsDB').collection('submitted')
    const futureCollection = client.db('assignmentsDB').collection('future')


    // jwt genetrate
    app.post('/jwt', async(req, res)=>{
      
      const user = req.body
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn:'365d'})
      res.cookie('token',token,{
        httpOnly: true,
        secure: process.env.NODE_ENV==='production',
        sameSite: process.env.NODE_ENV==='production'?'none':'strict'
      }).send({success: true})
    })

    // clear token 
    app.get('/logout', (req, res)=>{
      res.clearCookie('token', {
        httpOnly:true,
        secure: process.env.NODE_ENV==='production',
        sameSite: process.env.NODE_ENV==='production'?'none':'strict',
        maxAge: 0,
      }).send({success: true})
    })

    app.post('/assignments', async(req, res)=>{
        const assignments = req.body;
        console.log(assignments)
        const result = await assignmentsCollection.insertOne(assignments)
        res.send(result)
    })

    app.get('/assignments', async(req, res)=>{
        const result = await assignmentsCollection.find().toArray();
        res.send(result)
    })

    app.get('/future', async(req, res)=>{
        const result = await futureCollection.find().toArray();
        res.send(result)
    })

    app.get('/assignment/:id', async(req, res)=>{
        const id = req.params.id;
        // console.log(id)
        const query = { _id: new ObjectId(id)}
        const assignment = await assignmentsCollection.findOne(query)
        // console.log(assignment);
        res.send(assignment)
      })

      app.post('/submitted', async(req, res)=>{
        const submitted = req.body;
        console.log(submitted)
        const result = await submittedCollection.insertOne(submitted)
        res.send(result)
    })

    app.get('/submitted/:email',verifyToken, async(req, res)=>{
      const tokenEmail = req.user.email
      console.log('emai',req.params.email);
      const email = req.params.email
      if(tokenEmail!== email){
        return res.status(403).send({message: 'forbidden access'})
      }
      const query = { takerEmail: email}
      const result = await submittedCollection.find(query).toArray();
      res.send(result)
    })

    app.get('/pending', async(req, res)=>{
      const query = { status: 'Pending' }
      const result = await submittedCollection.find(query).toArray();
      res.send(result)
    })
    app.get('/marking/:id', async(req, res)=>{
      const id = req.params.id;
      console.log(id)
      const query = { _id: new ObjectId(id)}
      const find = await submittedCollection.findOne(query)
      res.send(find)
    })
    app.put('/marked/:id', async(req, res)=>{
      const id = req.params.id;
      console.log(id)
      const filter = { _id: new ObjectId(id)}
      const option = { upsert: true }
      const assignment = req.body;
      const givingMark = {
        $set:{
          gainedMark: assignment.gainedMark,
          feedback: assignment.feedback,
          status: assignment.status,
        }
      }
      const update = await submittedCollection.updateOne(filter, givingMark, option)
      res.send(update)
    })

    app.get('/update_assignment/:id', async(req, res)=>{
      const id = req.params.id;
      console.log(id)
      const query = { _id: new ObjectId(id)}
      const find = await assignmentsCollection.findOne(query)
      res.send(find)
    })

    app.put('/update_assignment/:id', async(req, res)=>{
      const id = req.params.id;
      console.log('from put',id);
      const filter = { _id: new ObjectId(id)}
      const option = { upsert: true }
      const assignment = req.body;
      const updatedAssignment = {
        $set:{
          title: assignment.title,
          deadline: assignment.deadline,
          difficulty_level: assignment.difficulty_level,
          thumbnail_url: assignment.thumbnail_url,
          marks: assignment.marks,
          description: assignment.description,
        }
      }
      const update = await assignmentsCollection.updateOne(filter, updatedAssignment, option)
      res.send(update)
    })

    app.delete('/delete/:id', async(req, res)=>{
      const id = req.params.id;
      const query = { _id: new ObjectId(id)}
      const result = await assignmentsCollection.deleteOne(query)
      res.send(result)
    })


      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
      // Ensures that the client will close when you finish/error
    //   await client.close();
    }
  }
  run().catch(console.dir);




app.get('/', (req, res)=>{
    res.send('study buddy server is running')
})

app.listen(port, ()=>{
    console.log(`study buddy server is running on port : ${port}`);
})