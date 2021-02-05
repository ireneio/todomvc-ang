export async function errCheckingMiddleware(fn: Function, params?: Array<any>) {
  try {
    const res: any = await fn.apply(params ? [...params] : [])
    Promise.resolve(res)
  } catch(e) {
    console.error(e.message)
    Promise.reject(e.message)
  }
}
