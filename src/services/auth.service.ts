import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../environments/environment';
import { from, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private supabase: SupabaseClient;

    constructor() {
        this.supabase = createClient(environment.supabase.url, environment.supabase.anonKey);
    }

    signUp(email: string, password: string, data: any): Observable<any> {
        return from(
            this.supabase.auth.signUp({
                email,
                password,
                options: {
                    data
                }
            })
        ).pipe(
            map(response => {
                if (response.error) throw response.error;
                return response.data;
            })
        );
    }

    signIn(email: string, password: string): Observable<any> {
        return from(
            this.supabase.auth.signInWithPassword({
                email,
                password
            })
        ).pipe(
            map(response => {
                if (response.error) throw response.error;
                return response.data;
            })
        );
    }

    signOut(): Observable<void> {
        return from(this.supabase.auth.signOut()).pipe(
            map(response => {
                if (response.error) throw response.error;
            })
        );
    }

    getUser(): Observable<User | null> {
        return from(this.supabase.auth.getUser()).pipe(
            map(response => response.data.user)
        );
    }

    getSession(): Observable<any> {
        return from(this.supabase.auth.getSession()).pipe(
            map(response => response.data.session)
        );
    }
}
