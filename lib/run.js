const
    spawn = require('child_process').spawn,
    Q = require('q');

module.exports = function ( o ) {
    const
        D = Q.defer(),
        LABEL = ( o.cwd ? '( at ' + o.cwd + ' ) ' : '' ) +
                [].concat(o.command, o.arguments).join(' '),
        child = spawn(
                o.command,
                o.arguments,
                {
                    stdio    : ['ignore', o.log, o.log],
                    cwd      : o.cwd,
                    detached : !!o.detachAfter
                }
            )
            .on('error', function(error){
                console.error('ERROR : process "' + LABEL + '" ', error);
                D.reject(error);
            })
            .on('close', function(exitCode){

                if ( exitCode !== 0 ) D.reject(Error(
                    'exit code of the process "' + LABEL + '" is ' + exitCode
                ));

                else D.resolve();
            });

    console.log('started : ' + LABEL);

    if ( !!o.detachAfter ) setTimeout(
        function(){
            child.unref();
            D.resolve();
        },
        o.detachAfter
    );

    return D.promise;
};
