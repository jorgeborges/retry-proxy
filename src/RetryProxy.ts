export class RetryProxy {
    private bindedLogFunc?: Function = undefined

    constructor (
        logObject?: Object,
        logFunc?: Function,
        private logLevel?: string
    ) {
        if (logObject && logFunc && logLevel) {
            this.bindedLogFunc = logFunc.bind(logObject)
        }
    }

  /**
   * Calls the function on the apiObject provided, in case of failure
   * while executing the function it will retry to a maximum defined by {retries}
   * leaving an interval of {retryInterval} milliseconds between each call.
   *
   * Returns a promise of the resolved value returned by the original API.
   *
   * @template T
   * @param {object} apiObject
   * @param {Function} func
   * @param {[any]} params
   * @param {number} [retries=3]
   * @param {number} [retryInterval=500]
   * @returns {Promise<T>}
   */
  public async callApi<T> (
    apiObject: object,
    func: Function,
    params: any[] = [undefined],
    retries: number = 3,
    retryInterval: number = 500
  ): Promise<T> {
    let result: T

    try {
      const bindedFunc = func.bind(apiObject)
      result = await bindedFunc(...params)
    } catch (error) {
        if (this.bindedLogFunc) {
            this.bindedLogFunc(
                this.logLevel,
                `RetryError - Attempts left: ${retries} - ${error.toString()}`
            )
        }

      if (retries === 0) {
        throw error
      }

      await this.wait(retryInterval)
      result = await this.callApi<T>(apiObject, func, params, retries - 1, retryInterval * 1.5)
    }

    return result
  }

  private async wait (milliseconds: number) {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
  }
}
