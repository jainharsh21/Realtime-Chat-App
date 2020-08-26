const { GraphQLServer } = require("graphql-yoga");

const messages = [];

// Type Definitions...Schema

// ! means the field is required

// Query can be considered as getting the data
// Mutation can be considered as a POST request

const typeDefs = `
    type Message {
        id: ID!
        user: String!
        content: String!
    }

    type Query{
        messages: [Message!]
    }

    type Mutation{
        postMessage(user: String!,content: String!): ID!
    }
`;

// Resolvers are functions used to populate the DB
const resolvers = {
  // get all the messages
  Query: {
    messages: () => messages,
  },
  // post a message
  Mutation: {
    postMessage: (parent, { user, content }) => {
      const id = messages.length;
      messages.push({
        id,
        user,
        content,
      });
      return id;
    },
  },
};

// create GraphQL server
const server = new GraphQLServer({ typeDefs, resolvers });
server.start(({ port }) => {
  console.log(`Server running on http://localhost:${port}/`);
});
