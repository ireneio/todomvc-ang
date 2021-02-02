import { Component, OnInit, ViewChild } from '@angular/core';
import {Apollo, gql} from 'apollo-angular';
import { subscribe } from 'graphql';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss']
})
export class TodoListComponent implements OnInit {
  constructor(private apollo: Apollo) { }

  public inputVal: string = ''

  public checkMode: boolean = false

  public dataOg: Array<any> = [
    { val: 'hello world', id: 0, checked: false },
    { val: 'hello world2', id: 10, checked: false }
  ]

  public data: Array<any> = [
    ...this.dataOg
  ]

  public get dataActiveCount(): number {
    return this.dataOg.filter((item: any) => item.checked === false).length
  }

  public handleItemCheck(val: any): void {
   const targetIndex = this.dataOg.findIndex((item : any) => {
     return item.id === Number(val.id)
   })

   const temp = [...this.dataOg]
   temp[targetIndex] = { ...val, checked: !val.checked }
   this.dataOg = [...temp]
  //  this.data = [...this.dataOg]
   this.data = this.pageUpdateHelper()
  }

  public handleItemRemove(val: any): void {
    this.dataOg = this.dataOg.filter((item: any) => {
      return item.id !== val.id
    })
    // this.data = [...this.dataOg]
    this.data = this.pageUpdateHelper()
  }

  // @ts-ignore
  @ViewChild('inputValNative') inputValNative;

  public handleChange(e: any): void {
    this.inputVal = e.target.value
  }

  public currentTab: number = 0

  public handleEnter(): void {
    this.dataOg.push({ id: this.data.length, checked: false, val: this.inputVal })
    this.data = [...this.dataOg]
    this.inputVal = ''
    this.inputValNative.nativeElement.value = ''
    this.data = this.pageUpdateHelper()
  }

  public handleItemCheckAll(): void {
    this.data = this.data.map((item: any) => {
      return { ...item, checked: !this.checkMode }
    })
    this.checkMode = !this.checkMode
  }

  public handleTabUpdate(val: number): void {
    this.currentTab = val
    let tempArr = this.dataOg.filter(item => {
      if(val === 0) {
        return item
      } else if(val === 1) {
        return item.checked === false
      } else if(val === 2) {
        return item.checked === true
      }
    })
    tempArr = this.pageUpdateHelper(tempArr)
    this.data = tempArr
  }

  public handleClearCompleted(): void {
    this.dataOg = this.dataOg.filter((item: any) => item.checked === false)
    // this.data = [...this.dataOg]
    this.data = this.pageUpdateHelper()
  }

  public pageLimit: number = 2

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

  private pageUpdateHelper(arr?: Array<any>): Array<any> {
    let target: Array<any> = [...this.dataOg]
    if(arr) {
      target = [...arr]
    }
    return target.filter((item: any, index: number) => {
      const min = (this.currentPage - 1) * this.pageLimit
      const max = min + this.pageLimit - 1
      return index <= max && index >= min
    })
  }

  ngOnInit(): void {
    this.pageUpdateHelper()
    console.log(this.apollo.watchQuery)
    this.apollo
      .watchQuery({
        // fetchPolicy: 'cache-and-network',
        query: gql`
          {
            list {
                id
                value
                status
            }
          }
        `,
      })
      .valueChanges.subscribe((result: any) => {
        console.log(result)
      }, (error: any) => {
        console.log(error)
      })
  }
}
