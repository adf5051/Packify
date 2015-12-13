var mongoose = require('mongoose');
var _ = require('underscore');

var ChecklistModel;

var ChecklistSchema = new mongoose.Schema( {
    adults: {
        heavyJacket : Boolean,
        lightJacket : Boolean,
        sandals : Boolean,
        boots : Boolean,
        shoes : Boolean,
        umbrella : Boolean,
        tshirts : Number,
        longsleeves : Number,
        sweaters : Number,
        underwear : Number,
        pants : Number,
        shorts : Number,
        socks : Number,
    },
    
    kids: {
        heavyJacket : Boolean,
        lightJacket : Boolean,
        sandals : Boolean,
        boots : Boolean,
        shoes : Boolean,
        umbrella : Boolean,
        tshirts : Number,
        longsleeves : Number,
        sweaters : Number,
        underwear : Number,
        pants : Number,
        shorts : Number,
        socks : Number,
    },
    
    misc: [{ name: String, amt: Number }],

    trip: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'Trip'
    },

    createdData: {
        type: Date,
        default: Date.now
    }
});

ChecklistSchema.methods.toAPI = function () {
    return {
        _id: this._id,
        all: this.all,
        misc: this.misc,
        trip: this.trip
    };
};

ChecklistSchema.statics.findByTripID = function (tripID, callback) {
    var search = { trip: mongoose.Types.ObjectId(tripID) };
    
    return ChecklistModel.findOne(search).populate('trip').exec(callback);
};

ChecklistModel = mongoose.model("Checklist", ChecklistSchema);

module.exports.ChecklistSchema = ChecklistSchema;
module.exports.ChecklistModel = ChecklistModel;