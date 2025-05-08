const { default: mongoose } = require("mongoose");

let reviewSchema = new mongoose.Schema({
    content: String,
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    owner: [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ]
});

module.exports = mongoose.model("Review",reviewSchema);