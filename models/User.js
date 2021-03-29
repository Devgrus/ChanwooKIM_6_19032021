const mongoose = require('mongoose');
// Pour que chaque email de l'utilisateur soit unique
const uniqueValidator = require('mongoose-unique-validator');

// Schéma <user>
const userSchema = mongoose.Schema({
    email: {type: String, required: true, unique: true},
    password : {type: String, required: true}
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);