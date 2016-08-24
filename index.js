var spawn = require('child_process').spawn;
var fs = require("fs");

var commandLineAndArguments = [];
Array.prototype.push.apply(commandLineAndArguments, process.argv.slice(2));
console.info("Running node " + commandLineAndArguments.join(" "));

try {
    var ps = spawn(commandLineAndArguments[0], commandLineAndArguments.slice(1));
    var grep = spawn('grep', ['ERROR']);
    var hasMatch = false;
    console.info("Child process PID: " + ps.pid);
    ps.stdout.on('data', function (data) {
        grep.stdin.write(data);
    });
    ps.stderr.on('data', function(data) {
        console.log(data);
    });
    ps.on("error", function(error) {
        console.error(error);
    });
    ps.on("close", function(code) {
        console.log("Child process ended with code " + code);
        grep.stdin.end();
    });
    grep.stdout.on('data', function(data)  {
        console.log("" + data);
        hasMatch = true;
    });

    grep.stderr.on('data', function(data)  {
        console.error("" + data);
    });

    grep.on('close', function(code)  {
        console.log('grep process exited with code ' + code);
        if (hasMatch) {
            console.log("Has match, exiting with code 1");
            process.exit(1);
        } else {
            console.log("No match, exiting with code 0");
            process.exit(0);
        }

    });
} catch (e) {
    console.error(e);
}