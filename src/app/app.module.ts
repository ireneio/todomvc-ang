import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BaseHeaderComponent } from './base-header/base-header.component';
import { TodoItemComponent } from './todo-item/todo-item.component';
import { TodoListComponent } from './todo-list/todo-list.component';
import { GraphQLModule } from './graphql.module';
import { HttpClientModule } from '@angular/common/http';
import { NewComponentComponent } from './new-component/new-component.component';
import { BaseLoaderComponent } from './base-loader/base-loader.component';

@NgModule({
  declarations: [
    AppComponent,
    BaseHeaderComponent,
    TodoItemComponent,
    TodoListComponent,
    NewComponentComponent,
    BaseLoaderComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    GraphQLModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
