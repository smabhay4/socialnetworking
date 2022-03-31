const express = require("express");
const postController = require("../controllers/post");
const router = express.Router();
const validator = require("../validator/index");
const { requireSignin } = require("../controllers/auth");
const { userById } = require("../controllers/user");

//frontend api to communicate with server
router.get("/posts", postController.route1);
router.post(
  "/post/new/:userId",
  requireSignin,
  postController.createPost,
  validator.createPostValidator
);
//like unlike
router.put("/post/like", requireSignin, postController.like);
router.put("/post/unlike", requireSignin, postController.unlike);
//comments
router.put("/post/comment", requireSignin, postController.comment);
router.put("/post/uncomment", requireSignin, postController.uncomment);
router.get("/post/by/:userId", requireSignin, postController.postByUser);
router.get("/post/:postId", postController.singlePost);
router.delete(
  "/post/:postId",
  requireSignin,
  postController.isPoster,
  postController.deletePost
);

router.put(
  "/post/:postId",
  requireSignin,
  postController.isPoster,
  postController.updatePost
);
//photo
router.get("/post/photo/:postId", postController.photo);

//any route containing userId our app will execute userById
router.param("userId", userById);

//any route containing postId our app will execute postById
router.param("postId", postController.postById);

module.exports = router;
