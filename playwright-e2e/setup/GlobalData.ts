class GlobalData {
  private static instance: GlobalData
  private _data: { key: string; value: any }[] = []

  private constructor() { }

  public static getInstance(): GlobalData {
    if (!GlobalData.instance) {
      GlobalData.instance = new GlobalData()
    }
    return GlobalData.instance
  }

  public get(key: string): any {
    const item = this._data.find(item => item.key === key)
    return item ? item.value : undefined
  }

  public set(key: string, value: any): void {
    this._data.push({ key, value })
  }

  public getAll(key: string): any[] {
    return this._data.filter(item => item.key === key).map(item => item.value)
  }

  public remove(key: string): void {
    this._data = this._data.filter(item => item.key !== key)
  }

  public clear(): void {
    this._data = []
  }

}

export default GlobalData.getInstance()
