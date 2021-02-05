import { Component, OnInit, ViewChild } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';

import { Todo } from '../types/index';
import TodoOperations from '../utils/todoController'

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss']
})
export class TodoListComponent implements OnInit {
  constructor(private apollo: Apollo) {
    this.controller = new TodoOperations(apollo)
  }

  private controller: TodoOperations

  private inputVal: string = ''

  private checkMode: boolean = false

  private dataOg: Array<Todo.ItemFe> = []

  public data: Array<Todo.ItemFe> = [
    ...this.dataOg
  ]

  public get dataActiveCount(): number {
    return this.dataOg.filter((item: any) => item.checked === false).length
  }

  public async handleItemCheck(val: Todo.ItemFe): Promise<void> {
    const item: Todo.ItemFe = this.dataOg.filter((item: any) => {
      return item.id === val.id
    })[0]
    const target: Todo.ItemHttpResponse = await this.controller.updateItem({ id: item.id, value: item.value, status: item.checked ? 1 : -1 })
    const index: number = this.dataOg.findIndex((item: Todo.ItemFe) => item.id === target.id)
    const temp = [...this.dataOg]
    temp[index] = { ...this.dataOg[index], status: item.checked ? 1 : -1 }
    this.dataSideEffectHelper({ list: [...temp] })
  }

  public async handleItemRemove(val: Todo.ItemFe): Promise<void> {
    const id: number = this.dataOg.filter((item: Todo.ItemFe) => {
      return item.id === val.id
    })[0].id
    const target: Todo.ItemHttpResponse = await this.controller.deleteItem(id)
    this.dataSideEffectHelper({ list: this.dataOg.filter((item: Todo.ItemFe) => item.id !== target.id) })
  }

  // @ts-ignore
  @ViewChild('inputValNative') inputValNative;

  public handleChange(e: any): void {
    this.inputVal = e.target.value
  }

  public currentTab: number = 0

  public async handleEnter(): Promise<void> {
    const item: Todo.ItemHttpResponse = await this.controller.createItem(this.inputVal)
    this.dataSideEffectHelper({ list: [{ ...item }, ...this.dataOg] })
    this.inputVal = ''
    this.inputValNative.nativeElement.value = ''
  }

  public async handleItemCheckAll(): Promise<void> {
    for await (let item of this.dataOg) {
      await this.controller.updateItem({ id: item.id, value: item.value, status: this.checkMode ? 1 : -1 })
    }
    let temp = [...this.dataOg]
    temp = temp.map((item: Todo.ItemFe) => ({ ...item, status: this.checkMode ? 1 : -1, checked: !this.checkMode }))
    this.dataSideEffectHelper({ list: [...temp] })
    this.checkMode = !this.checkMode
  }

  public async handleTabUpdate(val: number): Promise<void> {
    let item: Array<Todo.HttpResponse> = []
    if(val === 1) {
      item = await this.controller.getItemsSelect(1)
    } else if(val === 2) {
      item = await this.controller.getItemsSelect(-1)
    } else {
      item = await this.controller.getItems()
    }
    console.log(item)
    if(item.length) {
      window.localStorage.setItem('t', val.toString())
      this.currentTab = val
      this.dataSideEffectHelper({ list: [...item]})
    } else {
      alert('No Items in this tab...')
    }
  }

  public async handleClearCompleted(): Promise<void> {
    const temp: Array<Todo.ItemFe> = this.dataOg.filter((item: Todo.ItemFe) => item.status === -1)
    const temp2: Array<Todo.ItemFe> = this.dataOg.filter((item: Todo.ItemFe) => item.status !== -1)
    if(temp.length) {
      for(let i = 0; i < temp.length; i++) {
        await this.controller.deleteItem(temp[i].id)
      }
      this.dataSideEffectHelper({ list: [...temp2] })
    } else {
      alert('No Completed Items')
    }
  }

  public async handleItemInput(val: Todo.ItemFe): Promise<void> {
    const item: Todo.ItemFe = this.dataOg.filter((item: any) => {
      return item.id === val.id
    })[0]
    const target: Todo.ItemHttpResponse = await this.controller.updateItem({ id: item.id, value: val.value, status: item.status })
    const index: number = this.dataOg.findIndex((item: Todo.ItemFe) => item.id === target.id)
    const temp: Array<Todo.ItemFe> = [...this.dataOg]
    temp[index] = { ...temp[index], value: val.value }
    this.dataSideEffectHelper({ list: [...temp]})
  }

  private pageLimit: number = 5

  public get totalPages(): number {
    return Math.ceil(this.dataOg.length / this.pageLimit)
  }

  public currentPage: number = 1

  public handlePageUpdate(val: number): void {
   if(val === -1 && this.currentPage > 1) {
     this.currentPage += val
   } else if(val === 1 && this.currentPage < this.totalPages) {
     this.currentPage += val
   }
   this.data = this.pageUpdateHelper()
  }

  private pageUpdateHelper(arr?: Array<Todo.ItemFe>): Array<Todo.ItemFe> {
    let target: Array<Todo.ItemFe> = [...this.dataOg]
    if(arr) {
      target = [...arr]
    }
    const res: Array<Todo.ItemFe> = target.filter((item: any, index: number) => {
      const min = (this.currentPage - 1) * this.pageLimit
      const max = min + this.pageLimit - 1
      return index <= max && index >= min
    })
    return res
  }

  private dataSideEffectHelper(data: { list?: any, listQuery?: any }): void {
    if(data && data.list) {
      this.dataOg = [...data.list].map((item: any) => {
        return { ...item, val: item.value, checked: item.status === -1 ? true : false }
      })
    } else if (data && data.listQuery) {
      this.dataOg = [...data.listQuery].map((item: any) => {
        return { ...item, val: item.value, checked: item.status === -1 ? true : false }
      })
    }
    this.currentPage = 1
    this.data = this.pageUpdateHelper()
  }

  private initCheckMode(): boolean {
    let flag: boolean = false
    this.dataOg.forEach((item: any) => {
      if(item.status && item.status === -1) {
        flag = true
      } else {
        flag = false
      }
    })
    return flag
  }

  private async initItems(flag: number): Promise<void> {
    let data: Array<Todo.HttpResponse> = []
    if(flag === 0) {
      data = await this.controller.getItems()
    } else if(flag === 1) {
      data = await this.controller.getItemsSelect(1)
    } else if(flag === 2) {
      data = await this.controller.getItemsSelect(-1)
    }
    this.dataSideEffectHelper({ list: [...data] })
  }

  public async ngOnInit(): Promise<void> {
    this.checkMode = this.initCheckMode()
    const t: string | null = window.localStorage.getItem('t')
    if(t !== null) {
      await this.initItems(Number(t))
      this.currentTab = Number(t)
    } else {
      await this.initItems(0)
    }
  }
}
