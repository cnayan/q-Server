module.exports = (tableName, filter) => {
    return `select top 1 count(1) as [count] from ${tableName}${filter? ' ' + filter: ''}`;
}