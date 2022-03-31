const post = require("../models/post");
const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");

exports.createPost = (req, res) => {
  //const Post = new post(req.body);
  //console.log("CREATING POST :", Post);
  //M1 without validator
  // Post.save((err, result) => {
  //   if (err) {
  //     return res.status(400).json({
  //       error: err,
  //     });
  //   }
  //   res.status(200).json({
  //     post: result,
  //   });
  // });

  //M2 with validator
  // Post.save().then((result) => {
  //   res.json({
  //     post: result,
  //   });
  // });
  //console.log("I AM BACKEND✌️✌️");
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "IMAGE COULD NOT BE UPLOADED",
      });
    }
    let Post = new post(fields);

    Post.postedBy = req.profile;
    req.profile.hashed_password = undefined;
    req.profile.salt = undefined;
    // console.log(files);
    if (files.photo) {
      Post.photo.data = fs.readFileSync(files.photo.filepath);
      Post.photo.contentType = files.photo.type;
    }

    Post.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }
      res.json(result);
    });
  });
};

exports.route1 = (req, res) => {
  //HARDCODED
  // res.json({
  //   blog: [{ title: "First" }, { title: "Second" }],
  // });
  const Posts = post
    .find()
    .populate("postedBy", "_id name")
    .populate("comments", "text created")
    // .populate("comments.postedBy", "_id name")
    .select("_id title body created likes")
    .sort({ created: -1 })
    .then((posts) => {
      res.status(200).json(posts);
    })
    .catch((err) => console.log(err));
};

exports.postByUser = (req, res) => {
  post
    .find({ postedBy: req.profile })
    .populate("postedBy", "_id name")
    .select("_id title body created likes")
    .sort("_created")
    .exec((err, posts) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }
      res.json(posts);
    });
};

exports.postById = (req, res, next, id) => {
  post
    .findById(id)
    .populate("postedBy", "_id name")
    .populate("comments", "text created")
    .populate("comments.postedBy", "_id name")
    .exec((err, postt) => {
      if (err || !postt) {
        return res.status(400).json({ error: err });
      }
      req.post = postt;
      next();
    });
};

exports.isPoster = (req, res, next) => {
  let isPoster =
    req.post && req.auth && req.post.postedBy._id.toString() === req.auth._id;
  console.log("req.post:", req.post);
  console.log("req.auth:", req.auth);
  console.log("req.post.postedBy._id:", req.post.postedBy._id);
  console.log("req.auth._id", req.auth._id);
  if (!isPoster) {
    return res.status(403).json({
      error: "USER IS NOT AUTHORIZED",
    });
  }
  next();
};

exports.deletePost = (req, res) => {
  let post = req.post;
  post.remove((err, post) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }
    res.json({
      message: "POST DELETED SUCCESSFULLY",
    });
  });
};

// exports.updatePost = (req, res) => {
//   let post = req.post;
//   post = _.extend(post, req.body);
//   post.updated = Date.now();
//   console.log(post);
//   post.save((err) => {
//     if (err) {
//       return res.status(400).json({
//         error: "NOT AUTHORIZED TO PERFORM THIS ACTION",
//       });
//     }

//     res.json({ post });
//   });
// };
exports.updatePost = (req, res, next) => {
  let form = new formidable.IncomingForm();

  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Photo could not be uploaded",
      });
    }
    // save post
    let post = req.post;

    post = _.extend(post, fields);

    post.updated = Date.now();

    if (files.photo) {
      post.photo.data = fs.readFileSync(files.photo.filepath);
      post.photo.contentType = files.photo.type;
    } else {
      console.log("ooo terrr!!!--->", fields);
    }

    post.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }

      res.json(post);
    });
  });
};

exports.photo = (req, res, next) => {
  res.set("content-Type", req.post.photo.contentType);
  return res.send(req.post.photo.data);
};

exports.singlePost = (req, res) => {
  return res.json(req.post);
};

exports.like = (req, res) => {
  console.log(req.body.userId, req.body.posId);
  post
    .findByIdAndUpdate(
      req.body.postId,
      { $push: { likes: req.body.userId } },
      { new: true }
    )
    .exec((err, result) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }
      res.json(result);
    });
};

exports.unlike = (req, res) => {
  post
    .findByIdAndUpdate(
      req.body.postId,
      { $pull: { likes: req.body.userId } },
      { new: true }
    )
    .exec((err, result) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      } else res.json(result);
    });
};

exports.comment = (req, res) => {
  // console.log(req.body.userId, req.body.postId, req.body.comment);
  //let com = { text: req.body.comment, postedBy: req.body.userId,comments.postedBy:req.body.userId };
  let com = req.body.comment;
  com.postedBy = req.body.userId;

  // let postedBy = req.body.userId;
  //console.log(com);
  post
    .findByIdAndUpdate(
      req.body.postId,
      { $push: { comments: com } },
      { new: true }
    )
    .populate("comments.postedBy", "_id name")
    .populate("postedBy", "_id name")
    .exec((err, result) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }
      res.json(result);
    });
};

exports.uncomment = (req, res) => {
  let comment = req.body.comment;

  post
    .findByIdAndUpdate(
      req.body.postId,
      { $pull: { comments: { _id: comment._id } } },
      { new: true }
    )
    .populate("comments.postedBy", "_id name")
    .populate("postedBy", "_id name")
    .exec((err, result) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }
      res.json(result);
    });
};
