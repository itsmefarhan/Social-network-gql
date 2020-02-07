const { GraphQLSchema } = require("graphql");
const RootQuery = require("./gql/rootquery");
const Mutation = require("./gql/mutation");

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
});
