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
    PM.start({
        respawn : true,
        pidfile : CFG.daemon.pidfile,
        nmodule : 'server.js',
        cwd     : __dirname,
        logPrfx : 'DFM.LOG_',
        logPath : CFG.logs.path,
        isup : {
            timeout : 5000
        }
    })
    .done();
}
