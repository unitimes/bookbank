var mongoose = require('../support/db-connector.js'),
	ObjectId = mongoose.Types.ObjectId,
	Schema = mongoose.Schema;

var bookSchema = new Schema({
	title: String,
	info_link: String,
	writer: String,
	publisher: String,
	img_path: String,
	semester: Number,
	selector: {
		_id: { type: Schema.Types.ObjectId, ref: 'User' },
		name: String
	}
}); 
var Book = mongoose.model('Book', bookSchema);

exports.create = function(book, fCallback) {
	return Book.create(book, fCallback);
}; 
exports.getAll = function(fCallback) {
	return Book.find({}, null, { sort: { _id: -1}}, fCallback);
};
exports.getByKeywordsSemester = function(aKeywords, sem, fCallback) {
	return Book.find({
		'semester': sem,
		'$or': [
			{'writer': {
				'$in': aKeywords
			}},
			{'title': {
				'$in': aKeywords
			}},
			{'selector.name': {
				'$in': aKeywords
			}}
		]
	}, null, { 'sort': { '_id': -1 } }, fCallback);
};
exports.getBySemester = function(sem, fCallback) {
	return Book.find({
		'semester': sem
	}, null, { 'sort': { '_id': -1 } }, fCallback);
};
exports.getByKeywords = function(aKeywords, fCallback) {
	return Book.find({
		'$or': [
			{'writer': {
				'$in': aKeywords
			}},
			{'title': {
				'$in': aKeywords
			}},
			{'selector.name': {
				'$in': aKeywords
			}}
		]
	}, null, { 'sort': { '_id': -1 } }, fCallback);
};
exports.getById = function(id, fCallback) {
	return Book.findById(new ObjectId(id), fCallback);
};
