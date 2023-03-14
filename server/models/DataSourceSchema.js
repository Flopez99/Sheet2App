var mongoose = require('mongoose');

var Schema = mongoose.Schema;
//not sure if i should add key to the schema
const DataSourceSchema = new Schema({
    name: {type:String, required:true},
    url: {type:String, required:true},
    sheet_index: {type:Int, required:true},
    columns: [{type:Schema.Types.ObjectId, ref: 'Column'}],
    consistent: {type: Boolean, required: true}
})
const DataSource = mongoose.model('DataSource', DataSourceSchema);

module.exports = DataSource;