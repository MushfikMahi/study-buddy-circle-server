const express = require('express');
require('dotenv').config()
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
// middlewere

const corsOption = {
    origin: ['http://localhost:5173'], 
    Credential: true, 
}
app.use(cors())
app.use(express.json())

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

    app.get('/submitted/:email', async(req, res)=>{
      console.log('emai',req.params.email);
      const email = req.params.email
      const query = { takerEmail: email}
      const result = await submittedCollection.find(query).toArray();
      res.send(result)
    })

    app.get('/pending', async(req, res)=>{
      const query = { status: 'Pending' }
      const result = await submittedCollection.find(query).toArray();
      res.send(result)
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