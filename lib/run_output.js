const
    spawn = require('child_process').execFile,
    Q = require('q');

module.exports = function ( o ) {
    const
        D = Q.defer(),
        child = spawn(
            o.command,
            o.arguments,
            {},function(err,data){
                if (err) {
                    D.reject(err)
                } else {
                    D.resolve(data);
                }
            })


    return D.promise;
};
