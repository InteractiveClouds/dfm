#!/usr/bin/env node

const
    CFG = require('./lib/parseConfig')(),
    CMD = require('./lib/parseDaemonArgs')(process.argv.slice(2)),
    PM  = require('./lib/pm');

if ( CFG instanceof Error ) throw(CFG);
if ( CMD instanceof Error ) throw(CMD);


if ( CMD === 'stop' ) {

    PM.stop({
        pidfile : CFG.daemon.pidfile
    })
    .done();

} else if ( CMD === 'start' ) {

console.log('DIR : ' + __dirname);

    PM.start({
        pidfile : CFG.daemon.pidfile,
        nmodule : 'server.js',
        cwd     : __dirname,
        logPrfx : 'DFM.LOG_',
        logPath : CFG.logs.path
    })
    .done();
}
