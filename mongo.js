var webUri = 'mongodb://dp_admin:admin@cluster0-shard-00-00-e2ity.mongodb.net:27017,cluster0-shard-00-01-e2ity.mongodb.net:27017,cluster0-shard-00-02-e2ity.mongodb.net:27017/valhalla?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin';
var mongoose = require('mongoose');
// var accShema = mongoose.Schema({
//     Token: String,
//     Pawns: String,
//     Squads: String
// });
var squadsShema = mongoose.Schema({
    Token: String,
    Score: Number,
    SquadKey: String,
    Name: String,
    PawnKeys: Array,
});
var pawnsShema = mongoose.Schema({
    Token: String,
    PawnKey: String,
    Score: Number,
    Name: String,
    Json: String,
});

var squads = {};
var pawns = {};

class Mongo {
    constructor() {
        this.Init();
    }
    async Init() {
        await mongoose.connect(webUri, { useNewUrlParser: true });
        squads = mongoose.model('squads', squadsShema);
        pawns = mongoose.model('pawns', pawnsShema);
    }
    async DeletePawn(body) {
        var message = "Error";
        if (!body.PawnKey) return "Error! No PawnKey";
        var myquery = { PawnKey: body.PawnKey };
        pawns.findOneAndRemove(myquery, function (err) {
            message = "Error";
        }).exec();
        return message;
    }
    async UpdatePawn(body) {
        var message = "Error";
        if (!body.Token) return "Error! No Token";
        if (!body.PawnKey) return "Error! No PawnKey";
        if (!body.Score) return "Error! No Score";
        if (!body.Name) return "Error! No Name";
        if (!body.Json) return "Error! No Json";
        var myquery = { PawnKey: body.PawnKey };
        var item = await pawns.findOne(myquery).exec();
        var newvalues = {
            $set: {
                Name: body.Name,
                Score: body.Score,
                PawnKey: body.PawnKey,
                Token: body.Token,
                Json: body.Json
            }
        };
        console.log(item);
        if (item) {
            await pawns.updateOne(myquery, newvalues, (err, item) => {
                message = "Updated " + body;
                if (err)
                    message = "Updated Error";
                console.log(message);
            })
            var squadsArray = await squads.find({ Token: body.Token, PawnKeys: body.PawnKey }).exec();
            for (let a = 0; a < squadsArray.length; a++) {
                const s = squadsArray[a];
                var totalScore = 0;
                var oldScore = s.Score;
                for (let b = 0; b < s.PawnKeys.length; b++) {
                    if (s.PawnKeys[b].length > 3) {
                        var pawn = await pawns.findOne({ Token: body.Token, PawnKey: s.PawnKeys[b] }).exec();
                        totalScore += pawn.Score;
                    }
                }
                var newScore = {
                    $set: {
                        Score: totalScore
                    }
                };
                await squads.updateOne(s, newScore).exec();
                console.log("Squad " + s.Name + " updated", "old score: " + oldScore, "new score: " + totalScore);
            }
        }
        else await pawns.create(body, function (err, res) {
            message = "Created " + body;
            if (err)
                message = "Created Error";
            console.log(message);
        });
        return message;
    }
    async DeleteSquad(body) {
        var message = "Error";
        if (!body.SquadKey) return "Error! No Token";
        var myquery = { SquadKey: body.SquadKey };
        squads.findOneAndRemove(myquery, function (err) {
            message = "Error";
        }).exec();
        return message;
    }
    async UpdateSquad(body) {
        var message = "Error";
        if (!body.Token) return "Error! No Token";
        if (!body.Score) return "Error! No Score";
        if (!body.Name) return "Error! No Name";
        if (!body.PawnKeys) return "Error! No PawnKeys";
        if (!body.SquadKey) return "Error! No SquadKey";
        var myquery = { Token: body.Token, SquadKey: body.SquadKey };
        var item = await squads.findOne(myquery).exec();
        body.PawnKeys = body.PawnKeys.split(',');
        var newvalues = {
            $set: {
                Token: body.Token,
                PawnKeys: body.PawnKeys,
                Score: body.Score,
                SquadKey: body.SquadKey,
                Name: body.Name
            }
        };
        console.log(item);
        if (item)
            await squads.updateOne(myquery, newvalues, (err, item) => {
                message = "Updated " + body;
                if (err)
                    message = "Updated Error";
                console.log(message);
            })
        else await squads.create(body, function (err, res) {
            message = "Created " + body;
            if (err)
                message = "Created Error";
            console.log(message);
        });
        return message;
    }
    async GetSquads(body) {
        if (!body.Token) return "Error! No Token";
        var myquery = { Token: body.Token };
        var message = await squads.find(myquery).exec();
        return { Message: message };
    }
    async GetPawns(body) {
        if (!body.Token) return "Error! No Token";
        var myquery = { Token: body.Token };
        var message = await pawns.find(myquery).exec();
        return { Message: message };
    }
    async GetRandomSquad(body) {
        if (!body.Score) return "Error! No Score";
        var allSquads = await squads.find({}).exec();
        if (allSquads.length < 2) return "Not enought squads";
        var itterations = 0;
        var randomSquadFunc = () => {
            itterations++;
            if (itterations > 100) return "Error! Squads with nearest score not founds";
            var randomSquad = allSquads[Math.floor(Math.random() * allSquads.length)];
            if (randomSquad.Token == body.Token || Math.abs(randomSquad.Score - body.Score) > 10) return randomSquadFunc();
            else {
                console.log(randomSquad);
                return randomSquad;
            }
        }
        var squad = randomSquadFunc();
        if (squad) {
            var pawnsKeys = [];
            for (let b = 0; b < squad.PawnKeys.length; b++) {
                var pawn = "";
                if (squad.PawnKeys[b].length > 3) {
                    pawn = await pawns.findOne({ Token: body.Token, PawnKey: squad.PawnKeys[b] }).exec();
                }
                pawnsKeys.push(pawn);
            }
            // var pawnsArray = await pawns.find().where('PawnKey').in(pawnsKeys);
            return { Message: pawnsKeys };
        }
        else return squad;
    }
}

exports.Mongo = Mongo;