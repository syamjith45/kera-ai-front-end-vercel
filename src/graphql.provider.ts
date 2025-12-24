import { inject } from '@angular/core';
import { ApolloClientOptions, InMemoryCache, ApolloLink } from '@apollo/client/core';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { setContext } from '@apollo/client/link/context';
import { AuthService } from './services/auth.service';
import { firstValueFrom } from 'rxjs';

const uri = 'http://localhost:4000/graphql';

export const graphqlProvider = provideApollo((): ApolloClientOptions => {
    const httpLink = inject(HttpLink);
    const authService = inject(AuthService);

    const auth = setContext(async (_, { headers }) => {
        try {
            console.log('GraphQL Auth Provider - Fetching Session...');
            const session = await firstValueFrom(authService.getSession());
            const token = session?.access_token;
            console.log('GraphQL Auth Provider - Session:', session);
            console.log('GraphQL Auth Provider - Token:', token);
            return {
                headers: {
                    ...headers,
                    Authorization: token ? `Bearer ${token}` : '',
                }
            };
        } catch (e) {
            console.error('Error getting auth session', e);
            return { headers };
        }
    });

    return {
        link: auth.concat(httpLink.create({ uri })),
        cache: new InMemoryCache(),
    };
});
