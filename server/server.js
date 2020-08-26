const { GraphQLServer, PubSub } = require("graphql-yoga");

const messages = [];

// Type Definitions...Schema

// ! means the field is required

// Query can be considered as getting the data
// Mutation can be considered as a POST request
// With subscription it would listen to the channel and update any message in realtime

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

    type Subscription{
        messages : [Message!]
    }
`;

const subscribers = [];
const onMessageUpdates = (fn) => subscribers.push(fn);

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
      subscribers.forEach((fn) => fn());
      return id;
    },
  },
  Subscription: {
    messages: {
      subscribe: (parent, args, { pubsub }) => {
        const channel = Math.random().toString(36).slice(2, 15);
        onMessageUpdates(() => pubsub.publish(channel, { messages }));
        setTimeout(() => pubsub.publish(channel, { messages }), 0);
        return pubsub.asyncIterator(channel);
      },
    },
  },
};

const pubsub = new PubSub();

// create GraphQL server
const server = new GraphQLServer({ typeDefs, resolvers, context: { pubsub } });
server.start(({ port }) => {
  console.log(`Server running on http://localhost:${port}/`);
});
