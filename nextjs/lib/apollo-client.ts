import { ApolloClient, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  uri: `${process.env.HASURA_ENDPOINT}/v1/graphql`,
  cache: new InMemoryCache(),
  headers: {
    "X-Hasura-Admin-Secret": process.env.HASURA_ADMIN_SECRET,
  } as any,
});

export default client;
