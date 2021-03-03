require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });

var ObjectId = require('mongoose').Types.ObjectId;

let issueSchema = new mongoose.Schema({
    issue_title: { type: String, required: true },
    issue_text: { type: String, required: true },
    created_by: { type: String, required: true },
    assigned_to: { type: String, default: "" },
    status_text: { type: String, default: "" },
    open: { type: Boolean, default: true },
    created_on: { type: Date, default: new Date().toUTCString() },
    updated_on: { type: Date, default: new Date().toUTCString() },
}, { versionKey: false });

let Issue;

const setProject = (project) => {
    Issue = mongoose.model(`${project}_issue`, issueSchema);
}

const createAndSaveIssue = async (issueObject) => {
    try {
        const newIssue = new Issue(issueObject);
        let response = await newIssue.save();
        return response;
    } catch (error) {
        if (error.name == 'ValidationError') {
            return { error: 'required field(s) missing' }
        }
        return error;
    }
};

const getIssues = async (issueObject) => {
    try {
        let response = await Issue.find(cleanObject(issueObject));
        return response;
    } catch (error) {
        return error;
    }
};

const cleanObject = (obj) => {
    //https://stackoverflow.com/questions/286141/remove-blank-attributes-from-an-object-in-javascript
    return Object.entries(obj).reduce((a, [k, v]) => (v ? (a[k] = v, a) : a), {})
}

const findAndUpdate = async (id, issueObject) => {
    if (!id) {
        return { error: 'missing _id' };
    }

    try {
        issueObject = cleanObject(issueObject)

        if (Object.keys(issueObject).length === 0) {
            return { error: 'no update field(s) sent', '_id': id }
        }

        let found = await Issue.findById(id);

        if (!found) {
            return { error: 'could not update', '_id': id };
        }

        if (!issueObject.open) {
            issueObject.open = true;
        }

        issueObject.updated_on = new Date().toUTCString();

        let response = await Issue.findOneAndUpdate({ _id: id }, issueObject, { new: true });
        return { result: 'successfully updated', '_id': id }
    } catch (error) {
        return { error: 'could not update', '_id': id };
    }
};

const removeById = async (id) => {
    if (!id) {
        return { error: 'missing _id' };
    }
    try {
        let found = await Issue.findById(id);
        if (!found) {
            return { error: 'could not delete', '_id': id };
        }
        let response = await Issue.findByIdAndRemove(id);
        return { result: 'successfully deleted', _id: id }
    } catch (error) {
        return { error: 'could not delete', _id: id }
    }
};

exports.Issue = Issue;
exports.createAndSaveIssue = createAndSaveIssue;
exports.getIssues = getIssues;
exports.findAndUpdate = findAndUpdate;
exports.removeById = removeById;
exports.setProject = setProject;