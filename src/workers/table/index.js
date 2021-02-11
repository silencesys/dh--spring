import PromiseWorker from 'promise-worker'
import Worker from 'worker-loader!./worker'

const worker = new Worker()
const promiseWorker = new PromiseWorker(worker)

const filterData = (args) => promiseWorker.postMessage({
  type: 'dataFilter', ...args
})

export default { filterData }