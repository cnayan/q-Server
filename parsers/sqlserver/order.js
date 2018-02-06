module.exports = (order_by) => {
    let order_by_clause = undefined;

    if (order_by instanceof Array) {
        let order_fields = order_by
            .filter(orderInfo => orderInfo)
            .map(orderInfo => {
                let order = 'asc';
                if (typeof orderInfo !== 'string' && orderInfo.order && orderInfo.order.trim().toLowerCase() === 'desc') {
                    order = 'desc';
                }

                let field = orderInfo;
                if (typeof orderInfo !== 'string' && orderInfo.field) {
                    field = orderInfo.field;
                }

                if (field) {
                    // must be string type
                    field = field.trim();
                }

                return {
                    field,
                    order
                };
            })
            .filter(o => o.field)
            .map(o => `${o.field.toLowerCase()} ${o.order}`);

        //get unique elements
        order_fields = [...new Set([...order_fields])];

        if (order_fields.length > 0) {
            order_by_clause = `order by ${order_fields.join()}`;
        }
    }

    return order_by_clause;
}