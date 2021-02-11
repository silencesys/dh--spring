import registerPromiseWorker from 'promise-worker/register'

registerPromiseWorker(async (message) => {
  if (message.type === 'dataFilter') {
    //
  }
})