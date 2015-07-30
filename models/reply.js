var mongoose = require('../support/db-connector.js'),
	ObjectId = mongoose.Types.ObjectId,
	Schema = mongoose.Schema;

var replySchema = new Schema({
	replier: { 
		_id: { type: Schema.Types.ObjectId, ref: 'User' },
		name: String
	},
	book_id: Schema.Types.ObjectId,
	created_time: Date,
	edited_time: Date,
	content: String
});
var Reply = mongoose.model('Reply', replySchema);

exports.create = function(reply, fCallback) {
	return Reply.create(reply, fCallback);
};
exports.editContent = function(id, sContent, fCallback) {
	return Reply.findByIdAndUpdate(new ObjectId(id), { $set: { content: sContent, edited_time: new Date().toISOString() }}, fCallback);
};
exports.remove = function(id, fCallback) {
	return Reply.findByIdAndRemove(new ObjectId(id), fCallback);
};
exports.findByReplier = function(selector, fCallback) {
	return Reply.find({selector: new ObjectId(selector)}, fCallback);
};
exports.findByBookId = function(bookId, fCallback) {
	return Reply.find({book_id: new ObjectId(bookId)}, null, { sort: { edited_time: -1}}, fCallback);
};
