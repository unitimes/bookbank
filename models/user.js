var mongoose = require('../support/db-connector.js'),
	Schema = mongoose.Schema;

var userSchema = new Schema({
	name: String,
	email: { type: String, unique: true },
	password: String
});
var User = mongoose.model('User', userSchema);

exports.create = function(user, fCallback) {
	return User.create(user, fCallback);
};

exports.getByEmail = function(email, fCallback) {
	return User.find({ 'email': email },null,null, fCallback);
};
