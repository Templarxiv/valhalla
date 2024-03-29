var cluster = require('cluster');

if (cluster.isMaster) {
    cluster.fork();
    cluster.on('disconnect', function (worker) {
        console.error('disconnect!');
        cluster.fork();
    });
}
else {

    const mdb = require('./mongo');
    const db = new mdb.Mongo();
    const PORT = process.env.PORT || 8080;
    const express = require('express'),
        app = express(),
        bodyParser = require('body-parser');
    app.use(bodyParser.json());
    app.use(express.static(__dirname + '/public'));
    app.use(bodyParser.urlencoded({ extended: true }));

    app.post("/GetPawns", async (req, res) => {
        console.log(req.body);
        var message = await db.GetPawns(req.body);
        res.send(message);
    });
    app.post("/DeletePawn", async (req, res) => {
        console.log(req.body);
        var message = await db.DeletePawn(req.body);
        res.send(message);
    });
    app.post("/UpdatePawn", async (req, res) => {
        console.log(req.body);
        var message = await db.UpdatePawn(req.body);
        res.send(message);
    });
    app.post("/FindOpponent", async (req, res) => {
        console.log(req.body);
        var message = await db.GetRandomSquad(req.body);
        res.send(message);
    });
    app.post("/UpdateSquad", async (req, res) => {
        console.log(req.body);
        var message = await db.UpdateSquad(req.body);
        res.send(message);
    });
    app.post("/GetSquads", async (req, res) => {
        console.log(req.body);
        var message = await db.GetSquads(req.body);
        res.send(message);
    });
    app.post("/DeleteSquad", async (req, res) => {
        console.log(req.body);
        var message = await db.DeleteSquad(req.body);
        res.send(message);
    });
    app.get("/GetName", (req, res) => {
        var names = require('fs').readFileSync('./LatinNames.txt', 'utf-8').split(/\r?\n/);
        var index = Math.floor(Math.random() * names.length);
        var name = names[index];
        var name = name[0].toUpperCase() + name.slice(1);
        res.send(name);
    });
    app.listen(PORT);
}



