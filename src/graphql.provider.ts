import { inject } from '@angular/core';
import { ApolloClientOptions, InMemoryCache, ApolloLink } from '@apollo/client/core';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { setContext } from '@apollo/client/link/context';
import { AuthService } from './services/auth.service';
import { firstValueFrom } from 'rxjs';

const uri = 'https://kera-ai-backend.vercel.app/graphql';

export const graphqlProvider = provideApollo((): ApolloClientOptions => {
    const httpLink = inject(HttpLink);
    const authService = inject(AuthService);

    const auth = setContext(async (_, { headers }) => {
        try {

            const session = await firstValueFrom(authService.getSession());
            const token = session?.access_token;


            return {
                headers: {
                    ...headers,
                    Authorization: token ? `Bearer ${token}` : '',
                }
            };
        } catch (e) {

            return { headers };
        }
    });

    return {
        link: auth.concat(httpLink.create({ uri })),
        cache: new InMemoryCache(),
    };
});
