const {
  GraphQLID,
  GraphQLString,
  GraphQLNonNull,
  GraphQLObjectType
} = require("graphql");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Post = require("../models/Post");
const auth = require("../middleware/auth");

const { UserType, PostType } = require("./type");

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    // REGISTER USER
    registerUser: {
      type: UserType, // This will be return type
      args: {
        // This will be given by user as args
        username: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
        confirmPassword: { type: new GraphQLNonNull(GraphQLString) }
      },
      async resolve(parent, args, context, info) {
        const { username, email, password } = args;
        let user = await User.findOne({ username });
        if (user) {
          throw new Error("User already exists");
        }
        user = await User.findOne({ email });
        if (user) {
          throw new Error("Email already exists");
        }

        let newUser = new User({
          username,
          email,
          password,
          createdAt: new Date().toISOString()
        });

        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(password, salt);

        const res = await newUser.save();

        const token = jwt.sign(
          {
            id: res.id,
            username: res.username,
            email: res.email
          },
          "mysecret",
          { expiresIn: "2h" }
        );
        return {
          ...res._doc,
          token
        };
      }
    },
    // LOGIN USER
    loginUser: {
      type: UserType,
      args: {
        username: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) }
      },
      async resolve(parent, args) {
        const { username, password } = args;
        const user = await User.findOne({ username });
        if (!user) {
          throw new Error("Invalid Credentials");
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          throw new Error("Invalid Credentials");
        }
        const token = jwt.sign(
          {
            id: user.id,
            username: user.username,
            email: user.email
          },
          "mysecret",
          { expiresIn: "2h" }
        );
        return {
          ...user._doc,
          token
        };
      }
    },
    // CREATE POST
    createPost: {
      type: PostType,
      args: {
        body: { type: new GraphQLNonNull(GraphQLString) }
      },
      async resolve(parent, args, context) {
        const user = auth(context);
        // console.log('auth', user.id)

        const post = new Post({
          body: args.body,
          user: user.id,
          username: user.username,
          createdAt: new Date().toISOString()
        });
        return post.save();
      }
    },
    // DELETE POST
    deletePost: {
      type: GraphQLString,
      args: {
        _id: { type: new GraphQLNonNull(GraphQLString) }
      },
      async resolve(parent, args, context) {
        const user = auth(context);
        try {
          const post = await Post.findById({ _id: args._id });
          if (post.username !== user.username) {
            throw new Error(
              "You are not authorized to delete this post. Permission Denied"
            );
          }
          await post.remove();
          return "Post deleted";
        } catch (err) {}
      }
    },
    // ADD COMMENT
    addComment: {
      type: PostType,
      args: {
        postId: { type: new GraphQLNonNull(GraphQLID) },
        body: { type: new GraphQLNonNull(GraphQLString) }
      },
      async resolve(parent, args, context) {
        const user = auth(context);
        const { postId, body } = args;
        const post = await Post.findById(postId);
        if (!post) {
          throw new Error("No Post to comment on");
        }
        post.comments.unshift({
          body,
          username: user.username,
          createdAt: new Date().toISOString()
        });
        await post.save();
        return post;
      }
    },
    // DELETE COMMENT
    deleteComment: {
      type: PostType,
      args: {
        postId: { type: new GraphQLNonNull(GraphQLID) },
        commentId: { type: new GraphQLNonNull(GraphQLID) }
      },
      async resolve(parent, args, context) {
        const user = auth(context);
        const { postId, commentId } = args;
        const post = await Post.findById(postId);
        if (!post) {
          throw new Error("Post not found");
        }
        const comment = post.comments.find(comment => comment.id === commentId);
        if (comment.username === user.username) {
          post.comments.splice(comment, 1);
          await post.save();
          return post;
        }
      }
    },
    // LIKE / UNLIKE A POST
    likePost: {
      type: PostType,
      args: { postId: { type: new GraphQLNonNull(GraphQLID) } },
      async resolve(parent, args, context) {
        const user = auth(context);
        const post = await Post.findById(args.postId);
        if (!post) {
          throw new Error("Post not found");
        }
        // Check if post already liked then unlike it
        if (post.likes.find(like => like.username === user.username)) {
          post.likes = post.likes.filter(
            like => like.username !== user.username
          );
        } else {
          // like the post
          post.likes.push({
            username: user.username,
            createdAt: new Date().toISOString()
          });
        }
        await post.save();
        return post;
      }
    }
  }
});

module.exports = Mutation;
