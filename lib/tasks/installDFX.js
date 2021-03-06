var run  = require('../run');
var run_output = require('../run_output');
var Q    = require('q');
var QFS  = require('q-io/fs');
var replace = require("replace");
var semver = require("semver");
var fs = require("fs");


module.exports = function ( CFG , TASKS ) {
    var ip = Object.keys(TASKS.install)[0];
    return function(){
        console.log('Verifying requirements ...');
        return Q.resolve();
    }().then(function(){
        console.log('Starting installation of Dreamface ...');
        return QFS.exists('/var/lib/dreamface/dfx');
    }).then(function(exist){
        if (!exist) {
            console.log('Creating folders structure...');
            return Q.all([
                QFS.makeDirectory('/var/lib/dreamface/dfx'),
                QFS.makeDirectory('/var/lib/dreamface/dfc'),
                QFS.makeDirectory('/var/lib/dreamface/lock-files'),
                QFS.makeDirectory('/var/lib/dreamface/res_folders')
            ]).then(function(){
                return Q.all([
                    QFS.makeDirectory('/var/lib/dreamface/logs'),
                    QFS.makeDirectory('/var/lib/dreamface/res_folders/app_builds'),
                    QFS.makeDirectory('/var/lib/dreamface/res_folders/app_fsdb'),
                    QFS.makeDirectory('/var/lib/dreamface/res_folders/cmpTasks'),
                    QFS.makeDirectory('/var/lib/dreamface/res_folders/cmpTmp'),
                    QFS.makeDirectory('/var/lib/dreamface/res_folders/deploy'),
                    QFS.makeDirectory('/var/lib/dreamface/res_folders/devTemp'),
                    QFS.makeDirectory('/var/lib/dreamface/res_folders/devTmp'),
                    QFS.makeDirectory('/var/lib/dreamface/res_folders/resources')
                ]).then(function(){
                    console.log('Folders structure was created...');
                })
            });
        } else {
            console.log('Dreamface was already installed');
            process.exit(1);
        }
    }).then(function(){
        console.log('Start cloning services...');
        return run({
            command   : 'git',
            arguments : ['clone', 'git@github.com:InteractiveClouds/dfx.git','.'],
            cwd       : '/var/lib/dreamface/dfx'
        }).fail(function(){
            deleteFolderRecursive('/var/lib/dreamface/dfx');
            deleteFolderRecursive('/var/lib/dreamface/dfc');
            deleteFolderRecursive('/var/lib/dreamface/lock-files');
            deleteFolderRecursive('/var/lib/dreamface/res_folders');
            deleteFolderRecursive('/var/lib/dreamface/logs');
            console.log("Problem with clone repository - git@github.com:InteractiveClouds/dfx.git");
            process.exit(1);
        })
    }).then(function(){
        return run({
            command   : 'git',
            arguments : ['clone', 'git@github.com:InteractiveClouds/dfc.git','.'],
            cwd       : '/var/lib/dreamface/dfc'
        }).fail(function(){
            deleteFolderRecursive('/var/lib/dreamface/dfx');
            deleteFolderRecursive('/var/lib/dreamface/dfc');
            deleteFolderRecursive('/var/lib/dreamface/lock-files');
            deleteFolderRecursive('/var/lib/dreamface/res_folders');
            deleteFolderRecursive('/var/lib/dreamface/logs');
            console.log("Problem with clone repository - git@github.com:InteractiveClouds/dfc.git");
            process.exit(1);
        })
    }).then(function(){
        console.log("Creating all needed files");
        return QFS.copyTree('/var/lib/dreamface/dfm/installer_files/run_dev.js','/var/lib/dreamface/dfx/run_dev.js').then(function(){
            return QFS.copyTree('/var/lib/dreamface/dfm/installer_files/run_dep.js','/var/lib/dreamface/dfx/run_dep.js').then(function(){
                return QFS.copyTree('/var/lib/dreamface/dfm/installer_files/run_dfc.js','/var/lib/dreamface/dfc/run_dfc.js').then(function(){
                    console.log("All needed files are created");
                })
            })
        })
    }).then(function(){
        if (ip) {
            replace({
                regex: "IP",
                replacement: ip,
                paths: ['/var/lib/dreamface/dfx/run_dev.js', '/var/lib/dreamface/dfx/run_dep.js', '/var/lib/dreamface/dfc/run_dfc.js'],
                recursive: true,
                silent: true
            });
        } else {
            replace({
                regex: "IP",
                replacement: '127.0.0.1',
                paths: ['/var/lib/dreamface/dfx/run_dev.js', '/var/lib/dreamface/dfx/run_dep.js', '/var/lib/dreamface/dfc/run_dfc.js'],
                recursive: true,
                silent: true
            });
        }
        console.log("Finished. Now run 'dreamface update'");
    }).done();
};

var deleteFolderRecursive = function(path) {
    if( fs.existsSync(path) ) {
        fs.readdirSync(path).forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};
