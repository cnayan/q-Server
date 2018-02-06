module.exports = (info_limit) => {
    return info_limit !== undefined && info_limit > -1 ? `top ${info_limit}` : undefined;
}