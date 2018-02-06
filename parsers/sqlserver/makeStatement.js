module.exports = (tableName, limit, fields, filter, order_by_clause) => {
    return `select${fields !== '*'? ' distinct':''}${limit? ' ' +limit:''} ${fields} from ${tableName}${filter? ' ' + filter: ''}${order_by_clause? ' ' + order_by_clause:''}`;
}