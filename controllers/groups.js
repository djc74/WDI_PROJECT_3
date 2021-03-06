const Group = require('../models/group');

function groupsIndex(req, res) {
  Group.find({ eventId: req.params.eventId })
    .exec()
    .then(groups => res.status(200).json(groups))
    .catch(() =>
      res.status(500).json({ message: 'Something went wrong with the server' })
    );
}

function groupsShow(req, res) {
  Group.findById(req.params.id)
    .populate('comments.createdBy attendees createdBy')
    .exec()
    .then(group => res.status(200).json(group))
    .catch(() => res.status(500).json({ message: 'Something went wrong.' }));
}

function groupsCreate(req, res) {
  req.body.createdBy = req.user.userId;
  req.body.attendees = [req.user.userId];

  Group.create(req.body)
    .then(group => res.status(201).json(group))
    .catch(err => console.log(err));
}

function groupsUpdate(req, res) {
  Group.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .exec()
    .then(group => res.status(200).json(group))
    .catch(() => res.status(500).json({ message: 'Something went wrong.' }));
}

function groupsDelete(req, res) {
  Group.findByIdAndRemove(req.params.id)
    .then(() => res.sendStatus(204))
    .catch(() => res.status(500).json({ message: 'Something went wrong.' }));
}

function groupsJoin(req, res) {
  Group.findById(req.params.id)
    .then(group => {
      if (group.attendees.indexOf(req.user.userId) === -1) {
        group.attendees.push(req.user.userId);
        group.save();
        return res.status(200).json(group);
      } else {
        return res
          .status(500)
          .json({ message: 'User already attending this group' });
      }
    })
    .catch(() =>
      res.status(500).json({ message: 'Something went very wrong.' })
    );
}

function createComment(req, res, next) {
  req.body.createdBy = req.user.userId;

  Group.findById(req.params.id)
    .exec()
    .then(group => {
      if (!group) return res.notFound();
      console.log('this is the current group', req.group);
      group.comments.push(req.body);
      return group.save();
    })
    .then(group => res.status(201).json(group))
    .catch(next);
}

function deleteComment(req, res, next) {
  Group.findById(req.params.id)
    .exec()
    .then(group => {
      if (!group) return res.notFound();
      const comment = group.comments.id(req.params.commentId);
      comment.remove();
      return group.save();
    })
    .then(group => res.status(200).json(group))
    .catch(next);
}

module.exports = {
  index: groupsIndex,
  create: groupsCreate,
  join: groupsJoin,
  show: groupsShow,
  update: groupsUpdate,
  delete: groupsDelete,
  createComment: createComment,
  deleteComment: deleteComment
};
