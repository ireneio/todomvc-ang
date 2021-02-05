import { RouterModule } from "@angular/router"
import { Apollo, gql } from "apollo-angular"
import { Todo } from "../types"

export default class TodoOperations {
  constructor(private apollo: Apollo) {}

  private gqlQueryRequestHelper(query: string): Promise<Todo.HttpResponse> {
    return new Promise((resolve: Function, reject: Function) => {
      this.apollo
      .watchQuery({
        query: gql(query),
      })
      .valueChanges
      .subscribe((result: any) => {
        try {
          const { data } = result
          resolve(data)
        } catch(e) {
          console.log('query err: ', e.message)
          reject(new Error(e.message))
        }
      })
    })
  }

  private gqlMutationRequestHelper(query: string): Promise<Todo.HttpResponse> {
    return new Promise((resolve: Function, reject: Function) => {
      this.apollo.mutate({
        mutation: gql(query)
      }).subscribe(({ data }) => {
        resolve(data)
      },(error) => {
        console.log('mutation err: ', error)
        reject(new Error(error.message))
      })
    })
  }

  public async getItems(): Promise<any> {
    const { list } =  await this.gqlQueryRequestHelper(`
      query {
        list {
          id
          status
          value
        }
      }
    `)
    return list
  }

  public async getItemsSelect(status: number): Promise<any> {
    const { listQuery } = await this.gqlQueryRequestHelper(`
      query {
        listQuery(status: ${status}) {
          id
          status
          value
        }
      }
    `)
    return listQuery
  }

  public async updateItem({ id, status, value }: {id: number, status?: number, value?: string}): Promise<Todo.ItemHttpResponse> {
    const { update } = await this.gqlMutationRequestHelper(`
      mutation {
        update(id: ${id + ',' + (status ? 'status:' + status : '') + ',' + (value ? 'value:' + `"${value}"` : '')}) {
            id,
            value,
            status
        }
      }
    `)
    return update
  }

  public async deleteItem(id: number): Promise<Todo.ItemHttpResponse> {
    const { delete: val } = await this.gqlMutationRequestHelper(`
      mutation {
        delete(id: ${id}) {
            id,
            value,
            status
        }
      }
    `)
    return val
  }

  public async createItem(value: string): Promise<Todo.ItemHttpResponse> {
    const { create } = await this.gqlMutationRequestHelper(`
      mutation {
        create(value: "${value}") {
            id,
            value,
            status
        }
      }
    `)
    return create
  }
}
