// Packify
// Models - AccountDetails.js
// Author: Alex Fuerst

var mongoose = require('mongoose');
var _ = require('underscore');

var AccountDetailsModel;

var AccountDetailsSchema = new mongoose.Schema({
    name: {
        first: {
            type: String,
            required: true,
            trim: true
        },
        last: {
            type: String,
            required: true,
            trim: true
        },
    },
    
    email: {
        type: String,
        required: false,
        trim: true
    },

    owner: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'Account'
    },

    createdData: {
        type: Date, 
        default: Date.now
    }
});

AccountDetailsSchema.methods.toAPI = function () {
    return {
        name: this.name,
        email: this.email,
        username: owner.username
    };
};

AccountDetailsSchema.statics.findByOwner = function (ownerId, callback) {
    var search = { owner: mongoose.Types.ObjectId(ownerId) };
    
    return AccountDetailsModel.findOne(search,callback);
};

AccountDetailsModel = mongoose.model("AccountDetails", AccountDetailsSchema);

module.exports.AccountDetailsModel = AccountDetailsModel;
module.exports.AccountDetailsSchema = AccountDetailsSchema;