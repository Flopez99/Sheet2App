var mongoose = require('mongoose');

var Schema = mongoose.Schema;

const ColumnSchema = new Schema({
    name: {type: String, required:true},
    initial_value: {type: String},// any google sheet formula
    label: {type: Boolean, required:true }, //at most one column should be label column in table
    references: {type:Schema.Types.ObjectId, ref: 'DataSource'},//if column is reference than what table does it reference to
    type: {type: String, required:true } //Includes {Boolean, Number, Text, URL}


})
const Column = mongoose.model('Column', ColumnSchema);

module.exports = Column;