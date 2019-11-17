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
    const PORT = process.env.PORT || 8080;
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
    app.post("/FindOponent", (req, res) => {
        console.log(req.body);
        var players = require('./players.json');
        var array = Object.keys(players);
        var token = req.body.token;
        var randomPlayer = () => {
            var randomToken = array[Math.floor(Math.random() * array.length)];
            if (randomToken == token) return randomPlayer();
            var item = players[randomToken];
            console.log(item);
            return item;
        }
        res.send(randomPlayer());
    });
    app.post("/UpdatePawns", (req, res) => {
        var exists = fs.existsSync('./players.json');
        var file = {};
        if (exists)
            file = require('./players.json');
        // let file = fs.readFileSync('./players.json');
        console.log(file);
        var jsBody = req.body;
        console.log(jsBody);
        console.log(jsBody.token);
        if (jsBody.token && jsBody.token.length > 3 && file[jsBody.token]) {
            file[jsBody.token].Pawns = jsBody.pawns;
        }
        if (jsBody.token && jsBody.token.length > 3 && !file[jsBody.token]) {
            file[jsBody.token] = {};
            file[jsBody.token].Pawns = jsBody.pawns;
        }

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

