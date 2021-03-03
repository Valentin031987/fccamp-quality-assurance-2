'use strict';

var service = require('../service');

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(async function (req, res) {
      var project = req.params.project;
      service.setProject(project);

      let { _id, issue_title, issue_text, created_by, assigned_to, status_text, open } = req.query;
      return res.send(await service.getIssues({ _id, issue_title, issue_text, created_by, assigned_to, status_text, open }));
    })

    .post(async (req, res) => {
      var project = req.params.project;
      service.setProject(project);

      let { _id, issue_title, issue_text, created_by, assigned_to, status_text } = req.body;
      res.json(await service.createAndSaveIssue({ _id, issue_title, issue_text, created_by, assigned_to, status_text }));
    })

    .put(async function (req, res) {
      var project = req.params.project;
      service.setProject(project);

      let id = req.body._id;
      let { issue_title, issue_text, created_by, assigned_to, status_text, open } = req.body;
      res.json(await service.findAndUpdate(id, { issue_title, issue_text, created_by, assigned_to, status_text, open }));
    })

    .delete(async function (req, res) {
      var project = req.params.project;
      service.setProject(project);

      res.json(await service.removeById(req.body._id));
    });

};