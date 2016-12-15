var run  = require('../run');
var Q    = require('q');
var QFS  = require('q-io/fs');
var replace = require("replace");


module.exports = function ( CFG , TASKS ) {
    var ip = Object.keys(TASKS.install)[0];
    console.log('Starting installation of Dreamface ...');
    return QFS.exists('/var/lib/dreamface/dfx').then(function(exist){
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
        })
    }).then(function(){
        return run({
            command   : 'git',
            arguments : ['clone', 'git@github.com:InteractiveClouds/dfc.git','.'],
            cwd       : '/var/lib/dreamface/dfc'
        }).then(function(){
            console.log('All services was cloned successfully...');
        })
        return Q.resolve();
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
