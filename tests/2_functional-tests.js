const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  let testId;

  suite('POST /api/issues/{project} => issue object', function() {

    test('Create an issue with every field', function(done) {
      chai.request(server).post('/api/issues/test').send({
        issue_title: 'Title',
        issue_text: 'Text',
        created_by: 'Joe',
        assigned_to: 'Joe',
        status_text: 'In QA',
      }).end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, 'Title');
        assert.equal(res.body.issue_text, 'Text');
        assert.equal(res.body.created_by, 'Joe');
        assert.equal(res.body.assigned_to, 'Joe');
        assert.equal(res.body.status_text, 'In QA');
        assert.isTrue(res.body.open);
        testId = res.body._id;
        done();
      });
    });

    test('Create an issue with only required fields', function(done) {
      chai.request(server).post('/api/issues/test').send({
        issue_title: 'Title',
        issue_text: 'Text',
        created_by: 'Joe',
      }).end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, 'Title');
        assert.equal(res.body.issue_text, 'Text');
        assert.equal(res.body.created_by, 'Joe');
        assert.isTrue(res.body.open);
        assert.exists(res.body.created_on);
        assert.exists(res.body.updated_on);
        done();
      });
    });

    test('Create an issue with missing required fields', function(done) {
      chai.request(server).post('/api/issues/test').send({
        issue_title: 'Title',
      }).end(function(err, res) {
        assert.equal(res.status, 400);
        assert.equal(res.body.error, 'required field(s) missing');
        done();
      });
    });
  });

  suite('GET /api/issues/{project} => Array of issues', function() {

    test('View issues on a project', function(done) {
      chai.request(server).get('/api/issues/test').end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.property(res.body[0], 'issue_title');
        assert.property(res.body[0], 'issue_text');
        assert.property(res.body[0], 'created_on');
        assert.property(res.body[0], 'updated_on');
        assert.property(res.body[0], 'created_by');
        assert.property(res.body[0], '_id');
        done();
      });
    });

    test('View issues on a project with one filter', function(done) {
      chai.request(server).get('/api/issues/test').query({created_by: 'Joe'}).end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.equal(res.body[0].created_by, 'Joe');
        done();
      });
    });

    test('View issues on a project with multiple filters', function(done) {
      chai.request(server).get('/api/issues/test').query({created_by: 'Joe', open: true}).end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        res.body.forEach(issue => {
          assert.equal(issue.created_by, 'Joe');
          assert.isTrue(issue.open);
        });
        done();
      });
    });
  });

  suite('PUT /api/issues/{project} => text', function() {

    test('Update one field on an issue', function(done) {
      chai.request(server).put('/api/issues/test').send({
        _id: testId,
        issue_text: 'Updated text',
      }).end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body._id, testId);
        done();
      });
    });

    test('Update multiple fields on an issue', function(done) {
      chai.request(server).put('/api/issues/test').send({
        _id: testId,
        issue_text: 'Updated text',
        issue_title: 'Updated title',
      }).end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body._id, testId);
        done();
      });
    });

    test('Update an issue with missing _id', function(done) {
      chai.request(server).put('/api/issues/test').send({
        issue_text: 'Updated text',
      }).end(function(err, res) {
        assert.equal(res.status, 400);
        assert.equal(res.body.error, 'missing _id');
        done();
      });
    });

    test('Update an issue with no fields to update', function(done) {
      chai.request(server).put('/api/issues/test').send({
        _id: testId,
      }).end(function(err, res) {
        assert.equal(res.status, 400);
        assert.equal(res.body.error, 'no update field(s) sent');
        assert.equal(res.body._id, testId);
        done();
      });
    });

    test('Update an issue with an invalid _id', function(done) {
      chai.request(server).put('/api/issues/test').send({
        _id: 'invalid_id',
        issue_text: 'Updated text',
      }).end(function(err, res) {
        assert.equal(res.status, 400);
        assert.equal(res.body.error, 'could not update');
        assert.equal(res.body._id, 'invalid_id');
        done();
      });
    });
  });

  suite('DELETE /api/issues/{project} => text', function() {

    test('Delete an issue', function(done) {
      chai.request(server).delete('/api/issues/test').send({
        _id: testId,
      }).end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully deleted');
        assert.equal(res.body._id, testId);
        done();
      });
    });

    test('Delete an issue with an invalid _id', function(done) {
      chai.request(server).delete('/api/issues/test').send({
        _id: 'invalid_id',
      }).end(function(err, res) {
        assert.equal(res.status, 400);
        assert.equal(res.body.error, 'could not delete');
        assert.equal(res.body._id, 'invalid_id');
        done();
      });
    });

    test('Delete an issue with missing _id', function(done) {
      chai.request(server).delete('/api/issues/test').send({}).end(function(err, res) {
        assert.equal(res.status, 400);
        assert.equal(res.body.error, 'missing _id');
        done();
      });
    });

  });

});
