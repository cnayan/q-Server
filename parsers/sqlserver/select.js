const sqlTableName = require('./tableName');
const selectFields = require('./selectFields');
const sqlLimit = require('./limit');
const sqlOrder = require('./order');
const sqlFilter = require('./where');
const sqlMakeStatement = require('./makeStatement');

module.exports = function parse(db, arrayOfSelects, SQL) {
    if (arrayOfSelects instanceof Array) {
        return new Promise((res, rej) => {
            try {
                res(_runQuery(db, arrayOfSelects, SQL));
            } catch (error) {
                rej(error);
            }
        });
    }

    throw Error('Invalid object; need an array.');
}

async function _runQuery(db, arrayOfSelects, SQL) {
    let requests = [];

    for (const select of arrayOfSelects) {
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
        let limit = sqlLimit(info.limit);
        let fields = selectFields(info.fields, order_by);
        let filter = sqlFilter(info.filter);
        let order_by_clause = sqlOrder(order_by);

        let statement = sqlMakeStatement(tableName, limit, fields, filter, order_by_clause);

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