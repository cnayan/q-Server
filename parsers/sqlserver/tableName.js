module.exports = (db, tableName) => {
    if (db) {
        return `[${db}].[dbo].[${tableName}]`;
    }

    return `[dbo].[${tableName}]`;
}