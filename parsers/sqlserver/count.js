const sqlTableName = require('./tableName');
const selectFields = require('./selectFields');
const sqlLimit = require('./limit');
const sqlOrder = require('./order');
const sqlFilter = require('./where');
const sqlMakeCountStatement = require('./makeCountStatement');

module.exports = function parse(db, arrayOfCounts, SQL) {
    if (arrayOfCounts instanceof Array) {
        return new Promise((res, rej) => {
            try {
                res(_runQuery(db, arrayOfCounts, SQL));
            } catch (error) {
                rej(error);
            }
        });
    }

    throw Error('Invalid object; need an array.');
}

async function _runQuery(db, arrayOfCounts, SQL) {
    let requests = [];

    for (const select of arrayOfCounts) {
        let tableName = undefined;
        let info = undefined;

        for (const key in select) {
            tableName = key;
            info = select[key];
            break;
        }

        if (!tableName || tableName.length <= 0) {
            throw Error('Unspecified table name');
        }

        let order_by = info.order_by;

        tableName = sqlTableName(db, tableName);
        let filter = sqlFilter(info.filter);

        let statement = sqlMakeCountStatement(tableName, filter);

        console.log(statement);

        requests.push({
            tableName: tableName,
            queryPromise: SQL.query(statement)
        });
    }

    let results = [];

    let res = await Promise.all(requests.map(x => x.queryPromise));
    for (let index = 0; index < requests.length; index++) {
        let rs = {};
        rs.tableName = requests[index].tableName;
        rs.records = res[index].recordset;
        results.push(rs);
    }

    return results;
}