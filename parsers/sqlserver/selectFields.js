module.exports = (info_fields, order_by) => {
    let fields = '*'; //all

    if (info_fields instanceof Array && info_fields.length > 0) {
        let field_array = info_fields.filter(f => f && f.trim().length > 0);
        let order_field_array = order_by instanceof Array && order_by.length > 0 ? _get_order_fields(order_by) : [];
        // union
        fields = [...new Set([...field_array, ...order_field_array])].join();
    }

    return fields;
}

function _get_order_fields(order_by) {
    return order_by.map(orderInfo => {
            let field = typeof orderInfo === 'string' ? orderInfo : orderInfo.field;
            return field ? field.trim() : undefined;
        })
        .filter(field => field && field.length > 0);
}