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
    PawnKeys: String,
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
        if (item)
            await pawns.updateOne(myquery, newvalues, (err, item) => {
                message = "Updated " + body;
                if (err)
                    message = "Updated Error";
                console.log(message);
            })
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
        var myquery = { Token: body.Token, Name: body.Name };
        var item = await squads.findOne(myquery).exec();
        var newvalues = {
            $set: {
                Token: body.Token,
                PawnKeys: body.PawnKeys.split(','),
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
            if (randomSquad.Token == body.Token) return randomSquadFunc();
            if (Math.abs(randomSquad.Score - body.Score) <= 10) {
                console.log(randomSquad);
                return randomSquad;
            }
            else randomSquadFunc();
        }
        var squad = randomSquadFunc();
        if (squad.Name) {
            // var myquery = { PawnKey: body.PawnKey };
            // squad.PawnKeys.forEach(key => {
            //     var pawn = await pawns.find(myquery).exec();
            // });
            var pawnsKeys = squad.PawnKeys;
            var pawnsArray = await pawns.find().where('PawnKey').in(pawnsKeys);
            return { Message: pawnsArray };
        }
        else return squad;
    }
}

exports.Mongo = Mongo;