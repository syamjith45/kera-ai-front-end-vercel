import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GraphqlService } from './services/graphql.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, CommonModule]
})
export class AppComponent implements OnInit {
  items$: Observable<any> | undefined;

  constructor(private graphqlService: GraphqlService) { }

  ngOnInit() {
    this.items$ = this.graphqlService.query(`
      query getItems {
        items {
          id
          name
          createdAt
        }
      }
    `);
  }
}
