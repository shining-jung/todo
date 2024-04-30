const express = require('express');
const app = express();
const port = 8080;

const url = 'mongodb+srv://wonny:S4XRdLC8WdkSPxK0@cluster0.zssp9co.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
//mongoDB : wonny/S4XRdLC8WdkSPxK0
//mongodb+srv://wonny:S4XRdLC8WdkSPxK0@cluster0.zssp9co.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
//npm i mongodb

const { MongoClient } = require('mongodb');
const client = new MongoClient(url);

const methodOverride = require('method-override');
app.use(methodOverride('_method'));

app.set('view engine', 'ejs');
//body파서 대체 express내장기능
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// const connetDb = async () => {
//     try {
//         await client.connect()
//         console.log('DB연결');
//         const db = client.db('todo')
//         await db.collection('posts').insertOne({ name : '홍길동', date : '2024-04-29'})
//         console.log('DB 추가 확인');
//     } catch (error) {
//         console.error(error); 
//     }    
// }

const getDBConnet = async () => {
    await client.connect();
    return client.db('todo');
}

app.get('/', (req, res) => {
    // res.send('서버개발시작');
    // res.sendFile(__dirname + '/index.html');
    res.render('index');
});
app.get('/list', async (req, res) => {
    try {
        const db = await getDBConnet();
        const posts = await db.collection('posts').find().sort({_id:-1}).toArray();
        res.render('list', {posts}); // {posts: posts}
    } catch (error) {
        console.error(error); 
    }      
});

app.post('/add', async (req, res)=>{
    const {title, dateOfGoals, today} = req.body
    try {
        const db = await getDBConnet();
        const result = await db.collection('counter').findOne({name: 'counter'});
        await db.collection('posts').insertOne({_id:result.totalPost+1, title , dateOfGoals, today});
        await db.collection('counter').updateOne({name:'counter'}, {$inc:{totalPost:1}});
    } catch (error) {
        console.error(error); 
    }    
    res.redirect('/list');
})

app.get('/detail/:id', async (req, res) => {
    const id = parseInt(req.params.id)
    try {
        const db = await getDBConnet();
        const post = await db.collection('posts').findOne({_id: id});
        res.render('detail', {post}); // {posts: posts}      
    } catch (error) {
        console.error('detail', error); 
    }      
});

app.get('/edit/:id', async (req, res) => {
    const id = parseInt(req.params.id)
    try {
        const db = await getDBConnet();
        const post = await db.collection('posts').findOne({_id: id});
        res.render('edit', {post});
    } catch (error) {
        console.error(error); 
    }      
});

app.post('/update', async (req, res) =>{
    const {id, today, title, dateOfGoals } = req.body
    try {
        const db = await getDBConnet();
        await db.collection('posts').updateOne({
            _id: parseInt(id)
        }, {
            $set: {today, title, dateOfGoals}
        });
    } catch (error) {
        console.error(error); 
    }      
    res.redirect('/list');
});

app.post('/delete', async (req, res) => {   
    try {
        const id = parseInt(req.body.postNum)
        const db = await getDBConnet();
        await db.collection('posts').deleteOne({_id:id});
        res.redirect('/list');
    } catch (error) {
        console.error(error); 
    }    
});

app.listen(port, () => {
    console.log(`서버실행중 ... ${port}`);
});
