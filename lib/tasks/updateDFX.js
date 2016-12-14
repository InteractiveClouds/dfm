const run  = require('../run');

module.exports = function ( CFG ) {

    console.log('updating dfx ...');

    const log  = require('../logStream').get({
            path   : CFG.logs.path,
            prefix : 'DFX.UPDATE.LOG'
        });

    return run({
        command   : 'git',
        arguments : ['fetch'],
        log       : log,
        cwd       : CFG.dfx.code.path
    })
    .then(function(){
        run({
            command   : 'git',
            arguments : ['checkout', CFG.dfx.code.git.branch],
            log       : log,
            cwd       : CFG.dfx.code.path
        })
    })
    .then(function(){
        return run({
            command   : 'git',
            arguments : ['pull', 'origin', CFG.dfx.code.git.branch],
            log       : log,
            cwd       : CFG.dfx.code.path
        })
    })
    .then(function(){
        return run({
            command   : 'npm',
            arguments : ['install'],
            log       : log,
            cwd       : CFG.dfx.code.path
        })
    })
    .then(function(){
        return run({
            command   : 'sudo',
            arguments : ['grunt','build'],
            log       : log,
            cwd       : CFG.dfx.code.path
        })
    });
};
