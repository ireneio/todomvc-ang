import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Todo } from '../types';

@Component({
  selector: 'app-todo-item',
  templateUrl: './todo-item.component.html',
  styleUrls: ['./todo-item.component.scss']
})
export class TodoItemComponent implements OnInit {

  @Input() val: any = {}

  @Output()
  itemChecked: EventEmitter<Todo.ItemFe> = new EventEmitter<Todo.ItemFe>()

  @Output()
  itemRemove: EventEmitter<Todo.ItemFe> = new EventEmitter<Todo.ItemFe>()

  @Output()
  itemInput: EventEmitter<Todo.ItemFe> = new EventEmitter<Todo.ItemFe>()

  constructor() { }

  public showCross: boolean = false

  public showInput: boolean = false

  public handleItemCheck(val: Todo.ItemFe): void {
    this.itemChecked.emit(val)
  }

  public handleItemRemove(val: Todo.ItemFe): void {
    this.itemRemove.emit(val)
  }

  public handleItemInput(e: any, val: Todo.ItemFe): void {
    if(e.target.value !== '') {
      this.itemInput.emit({ ...val, value: e.target.value })
    } else {
      alert('Please enter value.')
    }
  }

  ngOnInit(): void {
  }
}
