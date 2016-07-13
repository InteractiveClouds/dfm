const run  = require('../run');

module.exports = function ( CFG ) {

    console.log('updating dfc ...');

    const log  = require('../logStream').get({
            path   : CFG.logs.path,
            prefix : 'DFC.UPDATE.LOG_'
        });

    return run({
        command   : 'git',
        arguments : ['checkout', CFG.dfc.code.git.branch],
        log       : log,
        cwd       : CFG.dfc.code.path
    })
    .then(function(){
        return run({
            command   : 'git',
            arguments : ['pull', 'origin', CFG.dfc.code.git.branch],
            log       : log,
            cwd       : CFG.dfc.code.path
        })
    })
    .then(function(){
        return run({
            command   : 'npm',
            arguments : ['install'],
            log       : log,
            cwd       : CFG.dfc.code.path
        })
    });
};
