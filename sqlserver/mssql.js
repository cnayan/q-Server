// For Windows Auth to work, use 'msnodesqlv8'
const mssql = require('mssql/msnodesqlv8');

var exports = module.exports = {};

var pool = undefined;

exports.init = (config) => {
    try {
        pool = new mssql.ConnectionPool(config);
    } catch (error) {
        console.log(error);
    }
}

exports.connect = () => {
    return pool.connect();
}

exports.query = (query) => {
    if (pool) {
        return pool.request().query(query);
    }

    throw Error('SQL Connection not established');
}

exports.close = () => {
    if (pool) {
        // Must close the connection
        pool.close();
    }
}