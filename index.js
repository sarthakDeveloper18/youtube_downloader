var express = require("express");
var app = express();
var request = require("request");
var bodyParser = require("body-parser");
var fs = require("fs");
var youtube = require("youtube-dl");
var dotenv = require("dotenv");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
dotenv.config();
var cwd = __dirname;

app.get("/", function(req, res) {
    res.render("home");
});

app.post("/search", function(req, res) {
    var query = req.body.query;
    var finalQuery = "";
    var i = 0;
    for (i = 0; i < query.length; i++) {
        if (query[i] !== " ") {
            finalQuery += query[i];
        }
        else {
            finalQuery += "+";
        }
    }
    
    const url = "https://www.googleapis.com/youtube/v3/search?maxResults=10&part=snippet&q=" 
                + finalQuery 
                + "&key=" 
                + process.env.APICREDENTIAL;

    request(url, function(error, response, body) {
        if (error) {
            console.log(error);
        }
        var data = JSON.parse(body);
        console.log(data);
        res.render("search", {data: data});
    });
});

app.get("/download/:videoUrl", function(req, res) {
    var video = youtube("http://www.youtube.com/watch?v=" + req.params.videoUrl, 
    ["--format=18"],
    {cwd: cwd});
    var size, filename;

    video.on("info", function(info) {
        if (info.track === null) {
            track = String(info.title + ".mp4");
        }
        else {
            track = String(info.track + ".mp4");
        }
        size = info.size
        filename = info._filename
        res.writeHead(200, {
            "Content-Disposition": "attachment;filename=" + filename,
            'Content-Type': 'video/mp4',
            'Content-Length': size,
        });
    });;

    video.on('data',(data)=>{
        res.write(data)
    })

    video.on('end',(end)=>{
        res.end();
    })
});

app.get("/started", function(req, res) {
    res.render("started");
});

var port = 8080;
app.listen(port, function(req, res) {
    const log = 
    console.log("The Server is up!\n" + 
                "Go to your favourite Web Browser and visit localhost:" 
                + String(port) + " to see the Application");
});
