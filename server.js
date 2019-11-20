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
        var message = await db.GetPlayer(req.body);
        if (message.Pawns)
            res.send(message.Pawns);
        else res.send("Pawns for this player not found");
    });
    app.post("/UpdatePawns", async (req, res) => {
        console.log(req.body);
        var message = await db.UpdatePawns(req.body);
        res.send(message);
    });
    app.post("/FindOpponent", async (req, res) => {
        console.log(req.body);
        var message = await db.GetRandomPlayer(req.body);
        res.send(message);
    });
    app.post("/UpdateSquads", async (req, res) => {
        console.log(req.body);
        var message = await db.UpdateSquads(req.body);
        res.send(message);
    });
    app.post("/GetSquads", async (req, res) => {
        console.log(req.body);
        var message = await db.GetPlayer(req.body);
        if (message.Squads)
            res.send(message.Squads);
        else res.send("Squads for this player not found");
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



