// Loads the configuration from config.env to process.env
// require('dotenv').config({ path: './config.env' });

const express = require('express');

const recordRoutes = express.Router();
// get MongoDB driver connection

const conn = require('./conn');

let dbo;
const PORT = process.env.PORT || 5000;
const app = express();



recordRoutes.route('/listings/recordSwipe').post(function (req, res) {
    const dbConnect = getDb();
    const matchDocument = {
        last_modified: new Date(),
        session_id: req.body.session_id,
        direction: req.body.direction,
    };

    dbConnect
        .collection('matches')
        .insertOne(matchDocument, function (err, result) {
            if (err) {
                res.status(400).send('Error inserting matches!');
            } else {
                console.log(`Added a new match with id ${result.insertedId}`);
                res.status(204).send();
            }
        });
});
recordRoutes.route('/listings/swipeList').get(function (req, res) {
    const dbConnect = getDb();

    dbConnect
        .collection('matches')
        .find({}).toArray().then(ff => {
            res.json(ff)
        });
});



app.use(express.json());
app.use(recordRoutes);

// Global error handling
app.use(function (err, _req, res) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// perform a database connection when the server starts
conn({
    host: "mongodb:27017",
    // host: ""
    pw: false,
    un: false,
    dbName: "dockerTest"
}).then(db => {
    dbo = db
    console.log("[MONGO CONNECTED]");
    app.listen(PORT, () => {
        console.log(`Server is running on port: ${PORT}`);
    });

})
