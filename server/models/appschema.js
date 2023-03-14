
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

const AppSchema = new Schema({
    creator: {type: String, required: true},
    app_name: {type: String, required: true},
    published: {type: Boolean, required: true},
    views: [{type:Schema.Types.ObjectId, ref: 'View'}],
    data_sources: [{type:Schema.Types.ObjectId, ref: 'DataSource'}],
    role_membership_url: {type:String, required:true}

})
const AppModel = mongoose.model('AppModel', AppSchema);

module.exports = AppModel;