const {  
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLList
} = require("graphql");

const Post = require("../models/Post");
const { PostType } = require("./type");

const RootQuery = new GraphQLObjectType({
  name: "RootQuery",
  fields: {
    // GET ALL POSTS
    getPosts: {
      type: new GraphQLList(PostType), // This will be return type
      async resolve(parent, args) {
        try {
          const posts = await Post.find().sort({ createdAt: -1 });
          return posts;
        } catch (err) {
          throw new Error(err);
        }
      }
    },
    // GET POST BY ID
    getPost: {
      type: PostType,
      args: {
        _id: { type: new GraphQLNonNull(GraphQLID) }
      },
      async resolve(parent, args) {
        try {
          const post = await Post.findById(args._id);
          if (!post) throw new Error("Post not found");
          return post;
        } catch (err) {
          throw new Error(err);
        }
      }
    }
  }
});

module.exports = RootQuery;
