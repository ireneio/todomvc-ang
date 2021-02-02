import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-todo-item',
  templateUrl: './todo-item.component.html',
  styleUrls: ['./todo-item.component.scss']
})
export class TodoItemComponent implements OnInit {

  @Input() val: any = {}

  @Output()
  itemChecked: EventEmitter<string> = new EventEmitter<string>()

  @Output()
  itemRemove: EventEmitter<string> = new EventEmitter<string>()

  constructor() { }

  public showCross: boolean = false

  public handleItemCheck(val: any): void {
    this.itemChecked.emit(val)
  }

  public handleItemRemove(val: any): void {
    this.itemRemove.emit(val)
  }

  ngOnInit(): void {
  }
}
