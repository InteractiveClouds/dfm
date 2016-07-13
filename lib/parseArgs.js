const
    RGX_IS_CMD_VALID = /^(restart|update)$/,
    RGX_IS_ARG_VALID = {
        update  : /^(?:dfx|dfc)$/,
        restart : /^(?:dep|dev|dfx|dfc)$/
    };

module.exports = function ( args ) {
    var raw = {
            update  : {},
            restart : {}
        },
        command = args[0];

    if ( !command ) return new SyntaxError('invalid invokation without a command');

    if ( !RGX_IS_CMD_VALID.test(command) ) {
        return new SyntaxError('unknown command ' + command);
    }

    for ( var i = 1, l = args.length; i < l; i++ ) {
        if ( !RGX_IS_ARG_VALID[command].test(args[i]) ) {
            return new SyntaxError(
                'invalid argument "' + args[i] +
                '" for the command "' + command + '"'
            );
        }

        raw[command][args[i]] = true;
    };


    var isUpdateEmpty  = command === 'update'  && !Object.keys(raw.update).length,
        isRestartEmpty = command === 'restart' && !Object.keys(raw.restart).length,
        clear = {
            update  : {
                dfc : !!raw.update.dfc || isUpdateEmpty,
                dfx : !!raw.update.dfx || isUpdateEmpty,
            },
            restart : {
                dep : !!raw.restart.dep || !!raw.restart.dfx || isRestartEmpty,
                dev : !!raw.restart.dev || !!raw.restart.dfx || isRestartEmpty,
                dfc : !!raw.restart.dfc || !!raw.update.dfc  || isRestartEmpty,
            }
        };

    if ( clear.update.dfx ) {
        clear.restart.dev = clear.restart.dep = clear.restart.dfc = true;
    }

    return clear;
};
