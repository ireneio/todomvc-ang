export namespace Todo {
  export interface HttpResponse {
    [index: string]: ItemHttpResponse
  }
  export interface ItemHttpResponse {
    id: number,
    status: 1 | -1,
    value: string
  }
  export interface ItemFe extends ItemHttpResponse {
    checked: boolean
  }
}
