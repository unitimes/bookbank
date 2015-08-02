var mongoose = require('../support/db-connector'),
	ObjectId = mongoose.Types.ObjectId,
	Schema = mongoose.Schema;

var commentSchema = new Schema({
	content: String,
	selector: {
		_id: { type: Schema.Types.ObjectId, ref: 'User' },
		name: String
	},
	related_book: {
		_id: { type: Schema.Types.ObjectId, ref: 'Book' },
		title: String
	}
});
var Comment = mongoose.model('Comment', commentSchema);

exports.create = function(comment, fCallback) {
	return Comment.create(comment, fCallback);
};
exports.remove = function(commentId, fCallback) {
	return Comment.remove({ '_id': commentId }, fCallback);
};
exports.getByBookId = function(bookId, fCallback) {
	return Comment.findOne({ 'related_book._id': bookId }, fCallback);
};
exports.update = function(comment, fCallback) {
	return Comment.findByIdAndUpdate(comment._id, comment, fCallback);
};
