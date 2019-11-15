var cluster = require('cluster');
const fs = require('fs');
if (cluster.isMaster) {
    cluster.fork();
    cluster.on('disconnect', function (worker) {
        console.error('disconnect!');
        cluster.fork();
    });
}
else {
    const PORT = 8080;

    const express = require('express'),
        app = express(),
        bodyParser = require('body-parser');

    // support parsing of application/json type post data
    app.use(bodyParser.json());

    app.use(express.static(__dirname + '/public'));
    //support parsing of application/x-www-form-urlencoded post data
    app.use(bodyParser.urlencoded({ extended: true }));

    app.post("/GetPawns", (req, res) => {
        console.log(req.body);
        // let data = fs.readFileSync('players.json');
        var file = require('./players.json');
        // let players = JSON.parse(file);
        var resData = "Token not exist";
        if (file[req.body.token])
            resData = file[req.body.token].Pawns
        console.log(resData);
        res.send(resData);
    });

    app.post("/UpdatePawns", (req, res) => {
        // let data = fs.readFileSync('players.json');
        var file = require('./players.json');
        console.log(file);
        var jsBody = req.body;
        console.log(jsBody);
        console.log(jsBody.token);
        console.log(file[jsBody.token]);
        file[jsBody.token].Pawns = jsBody.pawns;
        fs.writeFile('./players.json', JSON.stringify(file), function (err) {
            if (err) {
                res.send(err);
                console.log(err);
            }
            console.log(JSON.stringify(file));
            console.log('writing to ' + './players.json');
            res.send("Success");
        });

    });
    app.listen(PORT);
}

