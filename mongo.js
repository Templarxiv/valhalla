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
    async DeletePawn(player) {
        var message = "Error";
        if (!player.PawnKey) return "Error! No PawnKey";
        var myquery = { PawnKey: player.PawnKey };
        pawns.findOneAndRemove(myquery, function (err) {
            message = "Error";
        }).exec();
        return message;
    }
    async UpdatePawn(player) {
        var message = "Error";
        if (!player.Token) return "Error! No Token";
        if (!player.PawnKey) return "Error! No PawnKey";
        if (!player.Score) return "Error! No Score";
        if (!player.Name) return "Error! No Name";
        if (!player.Json) return "Error! No Json";
        var myquery = { PawnKey: player.PawnKey };
        var item = await players.findOne(myquery).exec();
        var newvalues = {
            $set: {
                Name: player.Name,
                Score: player.Score,
                PawnKey: player.PawnKey,
                Token: player.Token,
                Json: player.Json
            }
        };
        console.log(item);
        if (item)
            await players.updateOne(myquery, newvalues, (err, item) => {
                message = "Updated " + player;
                if (err)
                    message = "Updated Error";
                console.log(message);
            })
        else await players.create(player, function (err, res) {
            message = "Created " + player;
            if (err)
                message = "Created Error";
            console.log(message);
        });
        return message;
    }
    async UpdateSquads(player) {
        var message = "Error";
        if (!player.Token) return "Error! No Token";
        if (!player.Squads) return "Error! No Squads";
        var myquery = { Token: player.Token };
        var item = await players.findOne(myquery).exec();
        var newvalues = { $set: { Squads: player.Squads } };
        console.log(item);
        await players.updateOne(myquery, newvalues, (err, item) => {
            message = "Updated " + player;
            if (err)
                message = "Updated Error";
            console.log(message);
        })
        return message;
    }
    async GetPawns(player) {
        if (!player.Token) return "Error! No Token";
        var myquery = { Token: player.Token };
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