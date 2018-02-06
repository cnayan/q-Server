const sqlInstance = require('./mssql');
const SELECT = require('../parsers/sqlserver/select');
const COUNT = require('../parsers/sqlserver/count');

let config = undefined;

module.exports = async (query, value) => {
    if (query) {
        try {
            if (!config) {
                console.log(query);
                if (!query.config) {
                    throw Error("DB Connection configuration not provided");
                }

                _initConfig(query.config, query.db);
                await _sql_init();
            }

            value = value || {};
            let records = undefined;

            if (query.select) {
                records = await SELECT(query.db, query.select, sqlInstance);

                if (records && records.length > 0) {
                    value.select = records;
                }
            }

            if (query.count) {
                records = await COUNT(query.db, query.count, sqlInstance);

                if (records && records.length > 0) {
                    value.count = records;
                }
            }

            return {
                return_code: 0
            };

        } catch (error) {
            console.error(error);

            return {
                return_code: -(error.number || 200),
                text: error.message,
                value: error
            };
        }
    }

    return {
        return_code: -1,
        text: 'No query requested',
        value: undefined
    };
}

function _initConfig(conf, db) {
    // This config can also work

    // let config = {
    //     driver: 'msnodesqlv8',
    //     connectionString: `
    //     Driver={SQL Server Native Client 11.0};
    //     Server={localhost\\<instance>};
    //     Database={master};
    //     Trusted_Connection={yes};`
    // };

    config = conf;
    config.database = db || config.database;
    config.options = config.options || {};
    config.options.trustedConnection = true; // Force use of Windows Authentication only
}

function _sql_init() {
    sqlInstance.init(config);
    return sqlInstance.connect();
}