var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/book_bank');
module.exports = mongoose;
