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
    async UpdateSquad(body) {
        var message = "Error";
        if (!body.Token) return "Error! No Token";
        if (!body.Score) return "Error! No Score";
        if (!body.Name) return "Error! No Name";
        if (!body.PawnKeys) return "Error! No PawnKeys";
        var myquery = { Token: body.Token, Name: body.Name };
        var item = await squads.findOne(myquery).exec();
        
        var newvalues = { $set: { Squads: body.Squads } };
        console.log(item);
        await players.updateOne(myquery, newvalues, (err, item) => {
            message = "Updated " + body;
            if (err)
                message = "Updated Error";
            console.log(message);
        })
        return message;
    }
    async GetPawns(body) {
        if (!body.Token) return "Error! No Token";
        var myquery = { Token: body.Token };
        var pawns = await pawns.find(myquery).exec();
        return pawns;
    }
    async GetRandomPlayer(player) {
        if (!player.Token) return "Error! No Token";
        var allPlayers = await players.find({}).exec();
        if (allPlayers.length < 2) return "Not enought players";
        var randomPlayer = () => {
            var randomUser = allPlayers[Math.floor(Math.random() * allPlayers.length)];
            if (randomUser.Token == player.Token) return randomPlayer();
            console.log(randomUser);
            return randomUser;
        }
        return randomPlayer();
    }
}

exports.Mongo = Mongo;