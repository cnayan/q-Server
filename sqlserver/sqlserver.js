const runSelect = require('./runSelect');

module.exports = async (req, res, next) => {
    let command = req.body;
    if (!command) {
        res.json({
            return_code: -1,
            text: 'No command given',
            value: undefined
        });

        return;
    }

    try {
        let final_result = {};
        let value = {};

        let result = await runSelect(req.body, value);
        if (result.return_code < 0) {
            res.json(result);
            return;
        }

        final_result.return_code = result.return_code;
        final_result.value = value;

        res.json(final_result);
    } catch (error) {
        console.error(error);

        res.json({
            return_code: -10,
            text: JSON.stringify(error),
            value: undefined
        });
    }
}