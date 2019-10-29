const mongoose = require('mongoose'),
      bCrypt = require('bcrypt');

var UserSchema = mongoose.Schema({
    username: String,
    password: String
})

UserSchema.methods.encryptPassword = function(password) {
    return bCrypt.hashSync(password, bCrypt.genSaltSync(5), null);
}

UserSchema.methods.comparePassword = function(password) {
    return bCrypt.compareSync(password, this.password);
}

var user = mongoose.model("User", UserSchema);

module.exports = user;