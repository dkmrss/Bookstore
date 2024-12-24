const db = require('../configs/database');

class ExampleModel {
    static getAll(callback) {
        db.query('SELECT * FROM examples', (err, rows) => {
            if (err) throw err;
            callback(rows);
        });
    }
}

module.exports = ExampleModel;
