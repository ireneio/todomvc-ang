import { temporaryAllocator } from '@angular/compiler/src/render3/view/util';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss']
})
export class TodoListComponent implements OnInit {
  constructor(private apollo: Apollo) { }

  public inputVal: string = ''

  public checkMode: boolean = false

  public dataOg: Array<any> = []

  public data: Array<any> = [
    ...this.dataOg
  ]

  public get dataActiveCount(): number {
    return this.dataOg.filter((item: any) => item.checked === false).length
  }

  public handleItemCheck(val: any): void {
    const item = this.dataOg.filter((item: any) => {
      return item.id === val.id
    })[0]
    this.updateItem({ id: item.id, value: item.value, status: item.checked ? 1 : -1 })
    this.getItems()
  }

  public handleItemRemove(val: any): void {
    const id = this.dataOg.filter((item: any) => {
      return item.id === val.id
    })[0].id

    this.deleteItem(id)
    this.getItems()
  }

  // @ts-ignore
  @ViewChild('inputValNative') inputValNative;

  public handleChange(e: any): void {
    this.inputVal = e.target.value
  }

  public currentTab: number = 0

  public handleEnter(): void {
    this.createItem(this.inputVal)
    this.inputVal = ''
    this.inputValNative.nativeElement.value = ''
    this.getItems()
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
    const temp = this.dataOg.filter((item: any) => item.checked === true)
    if(temp.length) {
      for(let i = 0; i < temp.length; i++) {
        this.deleteItem(temp[i].id)
      }
      this.getItems()
    }
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
    const res = target.filter((item: any, index: number) => {
      const min = (this.currentPage - 1) * this.pageLimit
      const max = min + this.pageLimit - 1
      return index <= max && index >= min
    })
    console.log(res)
    return res
  }

  private getItems(): void {
    this.gqlQueryRequestHelper(`{
      list {
        id
        status
        value
      }
    }`)
  }

  private updateItem({ id, status, value }: {id: number, status?: number, value?: string}): void {
    this.gqlMutationRequestHelper(`
      mutation {
        update(id: ${id + ',' + (status ? 'status:' + status : '') + ',' + (value ? 'value:' + `"${value}"` : '')}) {
            id,
            value,
            status
        }
      }
    `)
  }

  private deleteItem(id: number): void {
    this.gqlMutationRequestHelper(`
      mutation {
        delete(id: ${id}) {
            id,
            value,
            status
        }
      }
    `)
  }

  private createItem(value: string): void {
    this.gqlMutationRequestHelper(`
      mutation {
        create(value: "${value}") {
            id,
            value,
            status
        }
      }
    `)
  }

  private dataSideEffectHelper(data: { list: any }): void {
    this.dataOg = [...data.list].map((item: any) => {
      return { ...item, val: item.value, checked: item.status === -1 ? true : false }
    })
    this.data = this.pageUpdateHelper()
  }

  private gqlQueryRequestHelper(query: string): Promise<any> {
    const res = this.apollo
      .watchQuery({
        query: gql(query),
      })
      .valueChanges.subscribe((result: any) => {
        try {
          const { data } = result
          console.log('got data: ', data)
          return this.dataSideEffectHelper(data)
        } catch(e) {
          console.log(e.message)
        }
      })
      return Promise.resolve(res)
  }

  private gqlMutationRequestHelper(query: string): void {
    this.apollo.mutate({
      mutation: gql(query)
    }).subscribe(({ data }) => {
      console.log('got data', data)
    },(error) => {
      console.log('there was an error sending the query', error);
    })
  }

  ngOnInit(): void {
    this.pageUpdateHelper()
    this.getItems()
  }
}
