const {
  GraphQLID,
  GraphQLString,
  GraphQLObjectType,
  GraphQLList
} = require("graphql");

// User Type
const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    // These fields will be returned
    _id: { type: GraphQLID },
    username: { type: GraphQLString },
    email: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    token: { type: GraphQLString }
  })
});

// Post Type
const PostType = new GraphQLObjectType({
  name: "Post",
  fields: () => ({
    // These fields will be returned
    _id: { type: GraphQLID },
    body: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    username: { type: GraphQLString },
    comments: { type: new GraphQLList(CommentType) },
    likes: { type: new GraphQLList(LikeType) }    
  })
});

// Comment Type
const CommentType = new GraphQLObjectType({
  name: "Comment",
  fields: () => ({
    _id: { type: GraphQLID },
    body: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    username: { type: GraphQLString }
  })
});

// Like Type
const LikeType = new GraphQLObjectType({
  name: "Like",
  fields: () => ({
    _id: { type: GraphQLID },
    createdAt: { type: GraphQLString },
    username: { type: GraphQLString }
  })
});

module.exports = { UserType, PostType };
