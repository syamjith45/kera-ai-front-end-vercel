import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class GraphqlService {
    constructor(private apollo: Apollo) { }

    // strict-typed query helper could be added here later with code generation
    query<T>(queryString: string, variables?: any): Observable<T> {
        return this.apollo.watchQuery<T>({
            query: gql`${queryString}`,
            variables,
        }).valueChanges.pipe(map(result => result.data as T));
    }

    mutate<T>(mutationString: string, variables?: any): Observable<T> {
        return this.apollo.mutate<T>({
            mutation: gql`${mutationString}`,
            variables,
        }).pipe(map(result => result.data as T));
    }
}
