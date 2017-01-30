const bareCommander = require('commander');

// shim to set command name (in help message)
bareCommander.name = str => {
    bareCommander._name = str;
    return bareCommander;
};

module.exports = bareCommander;
