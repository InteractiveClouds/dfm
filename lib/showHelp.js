const path = require('path');

module.exports = function () {

    console.log(
        require('fs')
        .readFileSync(path.join(__dirname, '../HELP.txt'))
        .toString('utf8')
    );
};
