import {NgModule} from '@angular/core';
import {APOLLO_OPTIONS} from 'apollo-angular';
import {ApolloClientOptions, InMemoryCache} from '@apollo/client/core';
import {HttpLink} from 'apollo-angular/http';

const flag: boolean = false

const uri = flag ? 'https://todomvc-api.azurewebsites.net/gql' : 'http://localhost:8081'; // <-- add the URL of the GraphQL server here
export function createApollo(httpLink: HttpLink): ApolloClientOptions<any> {
  return {
    link: httpLink.create({uri}),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
          fetchPolicy: 'cache-and-network',
          errorPolicy: 'ignore',
      },
      query: {
          fetchPolicy: 'network-only',
          errorPolicy: 'all',
      },
      mutate: {
          errorPolicy: 'all'
      }
    }
  };
}

@NgModule({
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink],
    },
  ],
})
export class GraphQLModule {}
