// NEVER SAVE THIS FILE TO PUBLIC REPO/Location
// if using git, ensure it is in the .gitignore file

var fs = require('fs');
var platform = require('./routes/server_nodejs/platform.js');
var runtime = platform.configure();

var secret = {

    isLiveSystem : function () { return runtime.liveSystem;},


    mongodb : {
        connectionStr : function ()
        {
            var username = "testing";
            var password = "TestIng1";
            var url      = "ds129720.mlab.com:29720";
            var database = "daly_dinners";
            runtime.mongodb =  url + "/" + database;
            return "mongodb://" + username + ":" + password  + "@" + url + "/" + database;
        }
    }
};


module.exports = secret;