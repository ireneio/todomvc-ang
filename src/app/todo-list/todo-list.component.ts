import { temporaryAllocator } from '@angular/compiler/src/render3/view/util';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Subscription } from 'rxjs';

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

  public async handleItemRemove(val: any): Promise<void> {
    const id = this.dataOg.filter((item: any) => {
      return item.id === val.id
    })[0].id

    await this.deleteItem(id)
    await this.getItems()
  }

  // @ts-ignore
  @ViewChild('inputValNative') inputValNative;

  public handleChange(e: any): void {
    this.inputVal = e.target.value
  }

  public currentTab: number = 0

  public async handleEnter(): Promise<void> {
    await this.createItem(this.inputVal)
    this.inputVal = ''
    this.inputValNative.nativeElement.value = ''
    await this.getItems()
  }

  public handleItemCheckAll(): void {
    this.data = this.data.map((item: any) => {
      return { ...item, checked: !this.checkMode }
    })
    this.checkMode = !this.checkMode
  }

  public async handleTabUpdate(val: number): Promise<void> {
    this.currentTab = val
    if(val === 1) {
      await this.getItemsSelect(0)
    } else if(val === 2) {
      await this.getItemsSelect(-1)
    } else {
      await this.getItems()
    }
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

  public pageLimit: number = 5

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
    return res
  }

  private async getItems(): Promise<void> {
    await this.gqlQueryRequestHelper(`
      query {
        list {
          id
          status
          value
        }
      }
    `)
  }

  private async getItemsSelect(status: number): Promise<void> {
    await this.gqlQueryRequestHelper(`
      query {
        listQuery(status: ${status}) {
          id
          status
          value
        }
      }
    `)
  }

  private async updateItem({ id, status, value }: {id: number, status?: number, value?: string}): Promise<void> {
    await this.gqlMutationRequestHelper(`
      mutation {
        update(id: ${id + ',' + (status ? 'status:' + status : '') + ',' + (value ? 'value:' + `"${value}"` : '')}) {
            id,
            value,
            status
        }
      }
    `)
  }

  private async deleteItem(id: number): Promise<void> {
    await this.gqlMutationRequestHelper(`
      mutation {
        delete(id: ${id}) {
            id,
            value,
            status
        }
      }
    `)
  }

  private async createItem(value: string): Promise<void> {
    await this.gqlMutationRequestHelper(`
      mutation {
        create(value: "${value}") {
            id,
            value,
            status
        }
      }
    `)
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

  private gqlQueryRequestHelper(query: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.apollo
      .watchQuery({
        query: gql(query),
      })
      .valueChanges
      .subscribe((result: any) => {
        try {
          const { data } = result
          console.log('got data: ', data)
          this.dataSideEffectHelper(data)
          resolve(true)
        } catch(e) {
          console.log(e.message)
          reject(e.message)
        }
      })
    })
  }

  private gqlMutationRequestHelper(query: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.apollo.mutate({
        mutation: gql(query)
      }).subscribe(({ data }) => {
        console.log('got data', data)
        resolve(true)
      },(error) => {
        console.log('there was an error sending the query', error)
        reject(error)
      })
    })
  }

  async ngOnInit(): Promise<void> {
    await this.getItems()
  }
}
