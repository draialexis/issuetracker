'use strict';

const {v4: uuidv4} = require('uuid');

let issues = {};

module.exports = function(app) {

  app.route('/api/issues/:project').get(function(req, res) {
    let project = req.params.project;
    let projectIssues = issues[project] || [];

    let filteredIssues = projectIssues.filter(issue => {
      for (let key in req.query) {
        if (issue[key] !== req.query[key]) {
          return false;
        }
      }
      return true;
    });

    res.json(filteredIssues);
  });

  app.route('/api/issues/:project').post(function(req, res) {
    let project = req.params.project;
    let {issue_title, issue_text, created_by, assigned_to, status_text} = req.body;

    if (!issue_title || !issue_text || !created_by) {
      return res.json({error: 'required field(s) missing'});
    }

    let newIssue = {
      _id: uuidv4(),
      issue_title,
      issue_text,
      created_by,
      assigned_to: assigned_to || '',
      status_text: status_text || '',
      created_on: new Date().toISOString(),
      updated_on: new Date().toISOString(),
      open: true,
    };

    if (!issues[project]) {
      issues[project] = [];
    }
    issues[project].push(newIssue);

    res.json(newIssue);
  });

  app.route('/api/issues/:project').put(function(req, res) {
    let project = req.params.project;
    let {_id, issue_title, issue_text, created_by, assigned_to, status_text, open} = req.body;

    if (!_id) {
      return res.json({error: 'missing _id'});
    }

    let updateFields = {};
    if (issue_title !== undefined && issue_title !== '') updateFields.issue_title = issue_title;
    if (issue_text !== undefined && issue_text !== '') updateFields.issue_text = issue_text;
    if (created_by !== undefined && created_by !== '') updateFields.created_by = created_by;
    if (assigned_to !== undefined && assigned_to !== '') updateFields.assigned_to = assigned_to;
    if (status_text !== undefined && status_text !== '') updateFields.status_text = status_text;
    if (open !== undefined) updateFields.open = open;

    if (Object.keys(updateFields).length === 0) {
      return res.json({error: 'no update field(s) sent', _id});
    }

    let projectIssues = issues[project] || [];
    let issue = projectIssues.find(issue => issue._id === _id);

    if (!issue) {
      return res.json({error: 'could not update', _id});
    }

    Object.assign(issue, updateFields);
    issue.updated_on = new Date().toISOString();

    res.json({result: 'successfully updated', _id});
  });

  app.route('/api/issues/:project').delete(function(req, res) {
    let project = req.params.project;
    let {_id} = req.body;

    if (!_id) {
      return res.json({error: 'missing _id'});
    }

    let projectIssues = issues[project] || [];
    let issueIndex = projectIssues.findIndex(issue => issue._id === _id);

    if (issueIndex === -1) {
      return res.json({error: 'could not delete', _id});
    }

    projectIssues.splice(issueIndex, 1);

    res.json({result: 'successfully deleted', _id});
  });

};
