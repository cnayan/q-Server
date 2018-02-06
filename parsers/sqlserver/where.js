if (!String.prototype.replaceAll) {
    String.prototype.replaceAll = function (search, replacement) {
        return this.split(search).join(replacement);
    };
}

const OP_AND = 0;
const OP_OR = 1;

module.exports = (filter) => {
    let where = undefined;
    let clauses = undefined;

    if (filter instanceof Array && filter.length > 0) {
        let filtered = _getFilters(filter);
        clauses = _buildClauses(filtered);

        if (clauses) {
            if (clauses.length > 1) {
                clauses = [clauses.join(' and ')];
            }

            where = clauses[0];
        }
    }

    if (where && where.length > 2 && where[0] === '(' && where[where.length - 1] === ')') {
        where = where.substring(1, where.length - 1);
    }

    return where && clauses && clauses.length ? 'where ' + where.trim() : undefined;
}

function _buildClauses(obj) {
    if (!obj) {
        throw Error('No object');
    }

    if (!(obj instanceof Array) && !obj.filters) {
        return _extract_clause_per_field(obj.fieldName, obj.info);
    }

    if (obj instanceof Array) {
        return obj.map(x => _buildClauses(x));
    }

    let where = '';
    let anyClause = false;

    let clauses = [];
    if (obj.filters) {
        clauses = _buildClauses(obj.filters);
    }

    if (clauses && clauses.length > 0) {
        anyClause = true;
        if (where.length) {
            where += ' and ';
            // where += ' ' + (obj.op === OP_AND ? 'and' : 'or') + ' ';
        }
        if (obj.op !== undefined) {
            if (clauses.length > 1) {
                where += '(';
            }

            switch (obj.op) {
                case OP_AND:
                    where += clauses.join(' and ');
                    break;
                case OP_OR:
                    where += clauses.join(' or ');
                    break;
            }

            if (clauses.length > 1) {
                where += ')';
            }
        } else {
            where += clauses;
        }
    }

    return where;
}

function _getFilters(array) {
    let filtered_array = array.filter(entry => {
        let fieldName = undefined;
        let sub = undefined;

        for (const key in entry) {
            fieldName = key;
            sub = entry[key];
            break;
        }

        if (!sub) {
            return false;
        }

        return true;
    });

    let arr2d = [];
    filtered_array.forEach(entry => {
        let fieldName = undefined;
        let sub = undefined;

        for (const key in entry) {
            fieldName = key;
            sub = entry[key];

            let op;
            switch (fieldName.toLocaleLowerCase()) {
                case 'or':
                    op = OP_OR;
                    break;
                case 'all':
                default:
                    op = OP_AND;
                    break;
            }

            if (sub instanceof Array) {
                let filterObjs = _getFilters(sub);
                let flat = [];
                arr2d.push({
                    filters: filterObjs,
                    op
                });
            } else {
                arr2d.push({
                    fieldName: fieldName,
                    info: sub
                });
            }
        }
    });

    return arr2d;
}

function _normalize(val) {
    let type = typeof val;
    switch (type) {
        case 'string':
            return val.replaceAll('"', '\'');

        case 'number':
            return val;
    }

    throw Error('Unhandled type - ' + val + ' (' + type + ')');
}

function _extract_clause_per_field(fieldName, info) {
    let gt_lt = undefined;
    let gt = info.gt;
    let lt = info.lt;

    if (gt && lt) {
        throw Error('Use either > or <, not both');
    }

    if (gt) {
        gt_lt = {
            type: 1,
            val: gt
        };
    } else if (lt) {
        gt_lt = {
            type: 0,
            val: lt
        };
    }

    let eq = info.eq;
    let not_eq = info.not_eq;
    let in_ = info.in;
    let not = info.not;
    let not_like = info.not_like;
    let like = info.like;

    let op = undefined,
        val = undefined;
    let statement = undefined;

    if (eq && in_) {
        throw Error('Cannot use = and "in" operators at same time')
    }

    if (eq && gt_lt) {
        if (gt_lt.type === 0) {
            op = '<=';
        } else if (gt_lt.type === 1) {
            op = '>=';
        } else {
            throw Error('Unknown operator - not < or >');
        }

        val = _normalize(gt_lt.val);
        statement = (statement ? statement + ' and ' : '') + fieldName + ' ' + op + ' ' + val;
    } else if (gt_lt) {
        if (gt_lt.type === 0) {
            op = '<';
        } else if (gt_lt.type === 1) {
            op = '>';
        } else {
            throw Error('Unknown operator - not < or >');
        }

        val = _normalize(gt_lt.val);
        statement = (statement ? statement + ' and ' : '') + fieldName + ' ' + op + ' ' + val;
    } else if (eq) {
        op = '=';
        val = _normalize(eq);
        if (val === 'null') {
            op = 'is';
        }
        statement = (statement ? statement + ' and ' : '') + fieldName + ' ' + op + ' ' + val;
    } else if (not_eq) {
        op = '<>';
        val = _normalize(not_eq);
        if (val === 'null') {
            op = 'is not';
        }
        statement = (statement ? statement + ' and ' : '') + fieldName + ' ' + op + ' ' + val;
    } else if (in_) {
        op = 'in';

        if (!(in_ instanceof Array)) {
            throw Error('In clause must have array of values');
        }

        val = '(' + in_.map(x => _normalize(x)).join() + ')';

        statement = (statement ? statement + ' and ' : '') + fieldName + ' ' + op + ' ' + val;
    }

    if (not) {
        op = 'not in';

        if (!(not instanceof Array)) {
            throw Error('In clause must have array of values');
        }

        val = '(' + not.map(x => _normalize(x)).join() + ')';
        statement = (statement ? statement + ' and ' : '') + fieldName + ' ' + op + ' ' + val;
    }

    if (like || not_like) {
        let text = undefined;
        if (like) {
            op = 'like';
            text = like;
        } else if (not_like) {
            op = 'not like';
            text = not_like;
        }

        text = text.replaceAll('*', '%');

        val = _normalize(text);
        statement = (statement ? statement + ' and ' : '') + fieldName + ' ' + op + ' ' + val;
    }

    return statement;
}