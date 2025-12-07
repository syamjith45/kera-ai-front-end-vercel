import { inject } from '@angular/core';
import { ApolloClientOptions, InMemoryCache } from '@apollo/client/core';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';

const uri = 'https://keraai-graphql-backend.vercel.app/';

export const graphqlProvider = provideApollo((): ApolloClientOptions => {
    const httpLink = inject(HttpLink);
    return {
        link: httpLink.create({ uri }),
        cache: new InMemoryCache(),
    };
});
