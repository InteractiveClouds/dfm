const Q = require('q');
    
module.exports = function ( o ) {
    const
        CFG   = o.CFG,
        TASKS = o.TASKS,
        M     = o.MODULES;

    var updateDFC = TASKS.update.dfc ? M.updateDFC(CFG) : Q.resolve(),
        updateDFX = TASKS.update.dfx ? M.updateDFX(CFG) : Q.resolve();

    if (!TASKS.install) {
        return Q.all([
            updateDFC,
            updateDFX.then(function () {
                return Q.all([
                    TASKS.restart.dev ? M.restartDEV(CFG) : Q.resolve(),
                    TASKS.restart.dep ? M.restartDEP(CFG) : Q.resolve()
                ])
                    .then(function () {
                        return TASKS.restart.dfc
                            ? updateDFC.then(M.restartDFC.bind(null, CFG))
                            : Q.resolve();
                    });
            })
        ]);
    } else {
        return Q.all([
            M.installDFX(CFG)
        ]);
    }
};
