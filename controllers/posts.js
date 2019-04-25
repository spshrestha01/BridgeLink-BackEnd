const Joi = require('joi');
const HttpStatus = require('http-status-codes');
const cloudinary = require('cloudinary');
const moment = require('moment');
const request = require('request');

cloudinary.config({
  cloud_name: 'df7kqxpgp',
  api_key: '429922755448125',
  api_secret: 'nXWq9OZjJC_IlWhEPISnLetit28'
});

const Post = require('../models/postModels');
const User = require('../models/userModels');

module.exports = {
  async AddPost(req, res) {
    const schema = Joi.object().keys({
      post: Joi.string().required()
    });
    const body = {
      post: req.body.post
    };
    const { error } = Joi.validate(body, schema);
    if (error && error.details) {
      return res.status(HttpStatus.BAD_REQUEST).json({ msg: error.details });
    }
    const bodyObj = {
      user: req.user._id,
      username: req.user.username,
      post: req.body.post,
      created: new Date()
    };

    if (req.body.post && !req.body.image) {
      Post.create(bodyObj)
        .then(async post => {
          await User.update(
            {
              _id: req.user._id
            },
            {
              $push: {
                posts: {
                  postId: post._id,
                  post: req.body.post,
                  created: new Date()
                }
              }
            }
          );
          res.status(HttpStatus.OK).json({ message: 'Post Create', post });
        })
        .catch(err => {
          res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({ message: 'Error Occured' });
        });
    }

    if (req.body.post && req.body.image) {
      cloudinary.uploader.upload(req.body.image, async result => {
        const reqBody = {
          user: req.user._id,
          username: req.user.username,
          post: req.body.post,
          imgId: result.public_id,
          imgVersion: result.version,
          created: new Date()
        };
        Post.create(reqBody)
          .then(async post => {
            await User.update(
              {
                _id: req.user._id
              },
              {
                $push: {
                  posts: {
                    postId: post._id,
                    post: req.body.post,
                    created: new Date()
                  }
                }
              }
            );
            res.status(HttpStatus.OK).json({ message: 'Post Create', post });
          })
          .catch(err => {
            res
              .status(HttpStatus.INTERNAL_SERVER_ERROR)
              .json({ message: 'Error Occured' });
          });
      });
    }
  },

  async GetAllPosts(req, res) {
    try {
      const today = moment().startOf('day');
      const tomorrow = moment(today).add(4, 'days');
      const posts = await Post.find({
        created: {
          $gte: today.toDate(),
          $lt: tomorrow.toDate()
        }
      })
        .populate('user')
        .sort({ created: -1 });

      const top = await Post.find({
        totalLikes: { $gte: 2 },
        created: {
          $gte: today.toDate(),
          $lt: tomorrow.toDate()
        }
      })
        .populate('user')
        .sort({ created: -1 });

      const user = await User.findOne({
        _id: req.user._id
      });

      if (user.city === '' && user.country === '') {
        request(
          'https://geoip-db.com/json/',
          { json: true },
          async (err, res, body) => {
            await User.update(
              {
                _id: req.user._id
              },
              {
                city: body.city,
                country: body.country_name
              }
            );
          }
        );
      }

      return res
        .status(HttpStatus.OK)
        .json({ messasge: 'All Posts', posts, top });
    } catch (err) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ messasge: 'Error Occured While Getting Posts' });
    }
  },

  async AddLike(req, res) {
    const postId = req.body._id;
    await Post.update(
      {
        _id: postId,
        'likes.username': { $ne: req.user.username }
      },
      {
        $push: {
          likes: {
            username: req.user.username
          }
        },
        $inc: { totalLikes: 1 }
      }
    )
      .then(() => {
        res.status(HttpStatus.OK).json({ message: 'You Like the post' });
      })
      .catch(err => {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Error Occured!' });
      });
  },

  async AddComment(req, res) {
    const postId = req.body.postId;
    await Post.update(
      {
        _id: postId
      },
      {
        $push: {
          comments: {
            userId: req.user._id,
            username: req.user.username,
            comment: req.body.comment,
            createdAt: new Date()
          }
        }
      }
    )
      .then(() => {
        res
          .status(HttpStatus.OK)
          .json({ message: 'Comment Added to the post' });
      })
      .catch(err => {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Error Occured!' });
      });
  },

  async GetPost(req, res) {
    await Post.findOne({ _id: req.params.id })
      .populate('user')
      .populate('comments.userId')
      .then(post => {
        res.status(HttpStatus.OK).json({ message: 'Post Found', post });
      })
      .catch(err =>
        res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: 'Post Not Found', post })
      );
  },

  EditPost(req, res) {
    const schema = Joi.object().keys({
      post: Joi.string().required(),
      id: Joi.string().optional()
    });
    const body = {
      post: req.body.post,
      created: new Date()
    };
    const { error } = Joi.validate(req.body, schema);
    if (error && error.details) {
      return res.status(HttpStatus.BAD_REQUEST).json({ msg: error.details });
    }

    Post.findOneAndUpdate(
      {
        _id: req.body.id
      },
      body,
      { new: true }
    )
      .then(post => {
        res
          .status(HttpStatus.OK)
          .json({ message: 'Post updated successfully', post });
      })
      .catch(err => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: err
        });
      });
  },

  async DeletePost(req, res) {
    try {
      const { id } = req.params;
      const result = await Post.findByIdAndRemove(id);
      console.log(result);
      if (!result) {
        res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: 'Could Not Delete Post!' });
      } else {
        await User.update(
          {
            _id: req.user._id
          },
          {
            $pull: {
              posts: {
                postId: result._id
              }
            }
          }
        );
        return res
          .status(HttpStatus.OK)
          .json({ message: 'Post Deleted Successfully !!' });
      }
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: err
      });
    }
  }
};
