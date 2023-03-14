var mongoose = require('mongoose');

var Schema = mongoose.Schema;

const ViewSchema = new Schema({
    name:{type:String, required:true},
    table: {type:Schema.Types.ObjectId, ref: 'DataSource'},
    columns: [{type:Schema.Types.ObjectId, ref: 'Column'}],
    view_type: {type:String, required:true}, //TableView, and DetailView
    add_record: {type: Boolean}, //only allowed in tableview
    edit_record: {type: Boolean}, //only allowed in detail view
    delete_record: {type: Boolean}, //only allowed in detail view
    roles: [{type: String, required:true}],
    filter: {type:Schema.Types.ObjectId, ref: 'Column'}, //column must be type boolean
    user_filter: {type:Schema.Types.ObjectId, ref: 'Column'},
    edit_filter: {type:Schema.Types.ObjectId, ref: 'Column'}, //can only exist if edit record is true
    editable_columns: [{type:Schema.Types.ObjectId, ref: 'Column'}]
});

const View = mongoose.model('View', ViewSchema);

module.exports = View;