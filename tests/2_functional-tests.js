const chaiHttp = require('chai-http');
const chai = require('chai');
let assert = chai.assert;
const server = require('../server');
chai.use(chaiHttp);

var ObjectId = require('mongoose').Types.ObjectId;
var ID = ObjectId();

suite('Functional Tests', function () {

    suite('POST /api/issues/{project} => Create an issue', function () {

        //return all object
        test('Send all fields', function (done) {
            // issue_title: { type: String, required: true },
            // issue_text: { type: String, required: true },
            // created_by: { type: String, required: true },
            // assigned_to: { type: String },
            // status_text: { type: String },
            // open: { type: Boolean },
            // created_on: { type: Date, default: new Date().toUTCString() },
            // updated_on: { type: Date, default: new Date().toUTCString() },

            let input = {
                issue_title: 'Title',
                issue_text: 'Text',
                created_by: 'Created by',
                assigned_to: 'AssignedTo',
                status_text: 'StatusText',
                //open: false,
                //created_on: new Date().toISOString(),
                //updated_on: new Date().toISOString()
            };

            input._id = ID

            chai.request(server)
                .post('/api/issues/apitest')
                .send(input)
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(ObjectId.isValid(res.body._id), true);
                    assert.equal(res.body.issue_title, input.issue_title);
                    assert.equal(res.body.issue_text, input.issue_text);
                    assert.equal(res.body.created_by, input.created_by);
                    assert.equal(res.body.assigned_to, input.assigned_to);
                    assert.equal(res.body.status_text, input.status_text);
                    assert.isTrue(res.body.open);
                    assert.isTrue((new Date(res.body.created_on).getTime() > 0))
                    assert.isTrue((new Date(res.body.updated_on).getTime() > 0))
                    done();
                });
        });

        //return all required fields, optionals as empty string
        test('Send only required fields', function (done) {
            let input = {
                issue_title: 'Title',
                issue_text: 'Text',
                created_by: 'Created by',
                //assigned_to: 'AssignedTo',
                //status_text: 'StatusText',
                //open: true,
                //created_on: new Date().toISOString(),
                //updated_on: new Date().toISOString()
            };

            chai.request(server)
                .post('/api/issues/apitest')
                .send(input)
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(ObjectId.isValid(res.body._id), true);
                    assert.equal(res.body.issue_title, input.issue_title);
                    assert.equal(res.body.issue_text, input.issue_text);
                    assert.equal(res.body.created_by, input.created_by);

                    assert.isTrue(res.body.open);
                    assert.isTrue((new Date(res.body.created_on).getTime() > 0))
                    assert.isTrue((new Date(res.body.updated_on).getTime() > 0))
                    done();
                });
        });

        //{ error: 'required field(s) missing' }
        test('With missing required fields', function (done) {
            let input = {
                issue_title: 'Title',
                //issue_text: 'Text',
                created_by: 'Created by',
                //assigned_to: 'AssignedTo',
                //status_text: 'StatusText',
                //open: true,
                //created_on: new Date().toISOString(),
                //updated_on: new Date().toISOString()
            };
            chai.request(server)
                .post('/api/issues/apitest')
                .send(input)
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.error, 'required field(s) missing');
                    done();
                });
        });

    });


    suite('GET /api/issues/{project} => View issues', function () {

        //array of all issues for that specific projectname
        test('View issues on a project', function (done) {
            chai.request(server)
                .get('/api/issues/apitest')
                .query({})
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body);

                    assert.property(res.body[0], 'issue_title');
                    assert.property(res.body[0], 'issue_text');
                    assert.property(res.body[0], 'created_on');
                    assert.property(res.body[0], 'updated_on');
                    assert.property(res.body[0], 'created_by');
                    assert.property(res.body[0], 'assigned_to');
                    assert.property(res.body[0], 'open');
                    assert.property(res.body[0], 'status_text');
                    assert.property(res.body[0], '_id');
                    done();
                });
        });

        test('View issues on a project with one filter', function (done) {
            chai.request(server)
                .get('/api/issues/apitest')
                .query({ open: true })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body);

                    assert.property(res.body[0], 'issue_title');
                    assert.property(res.body[0], 'issue_text');
                    assert.property(res.body[0], 'created_on');
                    assert.property(res.body[0], 'updated_on');
                    assert.property(res.body[0], 'created_by');
                    assert.property(res.body[0], 'assigned_to');
                    assert.property(res.body[0], 'open');
                    assert.property(res.body[0], 'status_text');
                    assert.property(res.body[0], '_id');

                    assert.isTrue(res.body[0].open);

                    done();
                });
        });

        test('View issues on a project with multiple filters', function (done) {
            chai.request(server)
                .get('/api/issues/apitest')
                .query({ open: true, created_by: 'Test Doe' })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body);

                    assert.property(res.body[0], 'issue_title');
                    assert.property(res.body[0], 'issue_text');
                    assert.property(res.body[0], 'created_on');
                    assert.property(res.body[0], 'updated_on');
                    assert.property(res.body[0], 'created_by');
                    assert.property(res.body[0], 'assigned_to');
                    assert.property(res.body[0], 'open');
                    assert.property(res.body[0], 'status_text');
                    assert.property(res.body[0], '_id');

                    done();
                });
        });

    });


    suite('PUT /api/issues/{project} => Update an issue', function () {

        let input = {
            _id: ID,
            issue_title: 'TitleUpdated',
            issue_text: 'TextUpdatet',
            //created_by: 'Created byUpdated',
        };

        test('Update one field on an issue', function (done) {
            chai.request(server)
                .put('/api/issues/apitest')
                .send(input)
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.result, 'successfully updated');
                    assert.equal(res.body._id, ID);
                    done();
                });
        });

        test('Update multiple fields on an issue', function (done) {
            let input = {
                _id: ID,
                issue_title: 'TitleUpdated',
                issue_text: 'TextUpdatet',
                created_by: 'Created byUpdated',
            };
            chai.request(server)
                .put('/api/issues/apitest')
                .send(input)
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.result, 'successfully updated');
                    assert.equal(res.body._id, ID);
                    done();
                });
        });

        //When the PUT request sent to /api/issues/{projectname} 
        //does not include an _id, the return value is { error: 'missing _id' }
        test('Update an issue with missing _id', function (done) {
            let input = {
                //_id: ID,
                issue_title: 'TitleUpdated',
                issue_text: 'TextUpdatet',
                created_by: 'Created byUpdated',
            };
            chai.request(server)
                .put('/api/issues/apitest')
                .send(input)
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.error, 'missing _id');
                    done();
                });
        });

        //When the PUT request sent to /api/issues/{projectname} does not include update fields, 
        //the return value is { error: 'no update field(s) sent', '_id': _id }. 
        //On any other error, the return value is { error: 'could not update', '_id': _id }.        
        test('Update an issue with no fields to update', function (done) {
            let input = {
                _id: ID,
                // issue_title: 'TitleUpdated',
                // issue_text: 'TextUpdatet',
                // created_by: 'Created byUpdated',
            };
            chai.request(server)
                .put('/api/issues/apitest')
                .send(input)
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.error, 'no update field(s) sent');
                    assert.equal(res.body._id, ID);
                    done();
                });
        });

        test('Update an issue with an invalid _id', function (done) {
            let input = {
                _id: 'invalid string id',
                issue_title: 'TitleUpdated',
                issue_text: 'TextUpdatet',
                created_by: 'Created byUpdated',
            };
            chai.request(server)
                .put('/api/issues/apitest')
                .send(input)
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.error, 'could not update');
                    assert.equal(res.body._id, input._id);
                    done();
                });
        });

    });

    suite('DELETE /api/issues/{project} => Delete an issue', function () {

        //You can send a DELETE request to /api/issues/{projectname} with an _id to delete an 
        //issue. If no _id is sent, the return value is { error: 'missing _id' }. 
        //On success, the return value is { result: 'successfully deleted', '_id': _id }. 
        //On failure, the return value is { error: 'could not delete', '_id': _id }.        
        test('Delete an issue with missing _id', function (done) {
            chai.request(server)
                .delete('/api/issues/apitest')
                .send({})
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.error, 'missing _id');
                    done();
                });
        });

        test('Delete an issue with an invalid _id', function (done) {
            chai.request(server)
                .delete('/api/issues/apitest')
                .send({ _id: 'invalid id' })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.error, 'could not delete');
                    done();
                });
        });

        test('Delete an issue', function (done) {
            let input = { _id: ID };
            chai.request(server)
                .delete('/api/issues/apitest')
                .send(input)
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.result, 'successfully deleted');
                    assert.equal(res.body._id, ID);
                    done();
                });
        });

    });

});