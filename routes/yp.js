var express = require('express');
var router = express.Router();
var request = require('request');

router.post('/find', function(req, res, next) {
    let data = {
        what: req.body.what,
        where : req.body.where,
        pgLen: 5,
        pg: 1,
        dist: 5,
        fmt: "JSON",
        lang: "en",
        UID: "1",
        apikey: "uvu5duaqz94wexb8sqghqm4q"
    };

    findBusiness(data, res);
});

function findBusiness(data, response){
    let url = "http://api.sandbox.yellowapi.com/FindBusiness/?";
    url += encodeQueryData(data)
    
    request.get(url, function(err, res, body) {
        if (err) {
            console.log(err)
            response.status(500).send(err);
        }else if(res.status === "200"){
            console.log(body)
            response.send(body)
        }
        response.status(500).send("status not 200")
    });
}

function encodeQueryData(data) {
   let ret = [];
   for (let d in data)
     ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
   return ret.join('&');
}

module.exports = router;