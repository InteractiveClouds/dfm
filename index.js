#!/usr/bin/env node

const TASKS = require('./lib/parseArgs')(process.argv.slice(2));

if ( TASKS instanceof Error ) {

    if ( TASKS instanceof SyntaxError ) {
        console.error('\n', TASKS.toString(), '\n\n', 'USAGE :');
        require('./lib/showHelp')();
        process.exit(1);
    }

    throw(TASKS);
}

const CFG = require('./lib/parseConfig')();

if ( CFG instanceof Error ) {
    console.error(CFG.message);
    process.exit(1);
}

require('./lib/runTasks')({
    TASKS : TASKS,
    CFG   : CFG,
    MODULES : {
        updateDFC  : require('./lib/tasks/updateDFC'),
        updateDFX  : require('./lib/tasks/updateDFX'),
        restartDEV : require('./lib/tasks/restartDEV'),
        restartDEP : require('./lib/tasks/restartDEP'),
        restartDFC : require('./lib/tasks/restartDFC')
    }
})
.done(); // TODO
