const
    RGX_IS_CMD_VALID = /^(start|stop)$/;

module.exports = function ( args ) {
    const CMD = args[0];

    if ( !CMD ) return new SyntaxError('invalid invokation without a command');

    if ( !RGX_IS_CMD_VALID.test(CMD) ) {
        return new SyntaxError('unknown command ' + CMD);
    }

    return CMD;
};
