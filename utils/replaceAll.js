function replaceAll(target, search, replacement) {
    return target.split(search).join(replacement);
}

if (!String.prototype.replaceAll) {
    String.prototype.replaceAll = function (search, replacement) {
        return this.split(search).join(replacement);
    };
}

module.exports = replaceAll;