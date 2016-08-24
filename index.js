#!/usr/bin/env node

var spawn = require('child_process').spawn;
var fs = require("fs");
var chalk = require("chalk");

var commandLineAndArguments = [];
Array.prototype.push.apply(commandLineAndArguments, process.argv.slice(2));

function printHelp() {
    console.log("Usage:");
    console.log("   node index.js PATTERN COMMAND");
    console.log("");
    console.log("If no match, returns 0. If match, returns 1. If error, returns 2");
    console.log("Example:");
    console.log("   node index.js ERROR more output.log");
}
try {
    if (commandLineAndArguments[0] === "--help") {
        printHelp();
        process.exit(2);
    }

    if (commandLineAndArguments.length < 2) {
        console.error("Bad arguments");
        printHelp();
    }

    console.info("Running " + commandLineAndArguments.join(" "));
    var ps = spawn(commandLineAndArguments[1], commandLineAndArguments.slice(2));
    var grep = spawn('grep', [commandLineAndArguments[0]]);
    var result = false;

    console.info("Child process PID: " + ps.pid);
    ps.stdout.on('data', function (data) {
        console.log("" + data);
        grep.stdin.write(data);
    });
    ps.stderr.on('data', function(data) {
        console.log(data);
    });
    ps.on("error", function(error) {
        console.error(error);
    });
    ps.on("close", function(code) {
        if (code !== 0) {
            console.log("Child process ended with code " + code);
            result = code;
        }
        grep.stdin.end();
    });
    grep.stdout.on('data', function(data)  {
        console.log(chalk.red("" + data));
        result = true;
    });

    grep.stderr.on('data', function(data)  {
        console.error("" + data);
    });

    grep.on('close', function(code)  {
        if (code === 2) {
            console.log('grep process exited with code ' + code);
            console.log(chalk.bold.red("grep exited with error, exiting with code 2"));
        }
        if (result instanceof Number && result > 0) {
            console.log(chalk.bold.red("Child process exited with error, exiting with code 2"));
            process.exit(2);
        }
        if (result) {
            console.log(chalk.bold.red("Has match, exiting with code 1"));
            process.exit(1);
        } else {
            console.log(chalk.bold.green("No match, exiting with code 0"));
            process.exit(0);
        }

    });
} catch (e) {
    console.error(e);
}