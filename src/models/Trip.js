var mongoose = require('mongoose');
var _ = require('underscore');

var TripModel;

var TripSchema = new mongoose.Schema( {
    location: {
        address: {
            type: String,
            required: true,
            trim: true
        },
        lat: {
            type: Number,
            required: true,
            trim: true
        },
        long: {
            type: Number,
            required: true,
            trim: true
        }
    },
    
    adults: {
        type: Number,
    },
    
    kids: {
        type: Number,
    },
    
    tripDate: {
        start: {
            type: Date,
        },
        end: {
            type: Date,
        }
    },
    
    owner: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'Account'
    },
    
    completed: {
        type: Boolean,
        required: true,
    },

    createdData: {
        type: Date,
        default: Date.now
    }
});

TripSchema.methods.toAPI = function () {
    return {
        _id: this._id
    };
};

TripSchema.statics.findByOwner = function (ownerId, callback) {
    var search = { owner: mongoose.Types.ObjectId(ownerId) };
    
    return TripModel.find(search, callback);
};

TripSchema.statics.findUnfinished = function (ownerId, callback) {
    var search = { owner: mongoose.Types.ObjectId(ownerId), completed: false };

    return TripModel.find(search, callback);
};

TripModel = mongoose.model("Trip", TripSchema);

module.exports.TripSchema = TripSchema;
module.exports.TripModel = TripModel;