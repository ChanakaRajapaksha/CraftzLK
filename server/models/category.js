const mongoose = require('mongoose');



const categorySchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    slug:{
        type:String,
        required:true,
        unique:true
    },
    images:[
        {
            type:String,
        }
    ],
    color:{
        type:String,
        default: ""
    },
    parentId:{
        type:String
    },
    description: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    },
    seo: {
        metaTitle: { type: String, default: "" },
        metaDescription: { type: String, default: "" },
        keywords: { type: String, default: "" },
    },
},{timestamps:true})

categorySchema.virtual('id').get(function () {
    return this._id.toHexString();
});

categorySchema.set('toJSON', {
    virtuals: true,
});

exports.Category = mongoose.model('Category', categorySchema);
exports.categorySchema = categorySchema;
