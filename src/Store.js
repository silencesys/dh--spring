import electron from 'electron'
import path from 'path'
import fs from 'fs'

class Store {
  constructor(opts) {
    // Renderer process has to get `app` module via `remote`, whereas the main process can get it directly
    // app.getPath('userData') will return a string of the user's app data directory path.
    const userDataPath = (electron.app || electron.remote.app).getPath('userData')

    // We'll use the `configName` property to set the file name and path.join to bring it all together as a string
    if (typeof opts === 'string') {
      this.path = path.join(userDataPath, opts)
      this.data = this.parseDataFile(this.path, null)
    } else {
      this.path = path.join(userDataPath, opts.fileName)
      this.data = this.parseDataFile(this.path, opts.defaults)
    }
  }

  // This will just return the property on the `data` object
  get(key = null) {
    if (key !== null && this.data && this.data.constructor === Object) {
      return this.data[key]
    } else if (typeof key === 'number' && Array.isArray(this.data)) {
      return this.data[key]
    } else {
      return this.data
    }
  }

  // ...and this will set it
  set(data) {
    if (data.key !== undefined && this.data && this.data.constructor === Object) {
      this.data[data.key] = data.value
    } else if (typeof key === 'number' && Array.isArray(this.data)) {
      this.data[data.key] = data.value
    } else {
      this.data = data
    }
    // Wait, I thought using the node.js' synchronous APIs was bad form?
    // We're not writing a server so there's not nearly the same IO demand on the process
    // Also if we used an async API and our app was quit before the asynchronous write had a chance to complete,
    // we might lose that data. Note that in a real app, we would try/catch this.
    try {
      fs.writeFileSync(this.path, JSON.stringify(this.data))
    } catch (error) {
      //
    }
  }

  parseDataFile (filePath, defaults) {
    // We'll try/catch it in case the file doesn't exist yet, which will be the case on the first application run.
    // `fs.readFileSync` will return a JSON string which we then parse into a Javascript object
    try {
      return JSON.parse(fs.readFileSync(filePath))
    } catch (error) {
      // if there was some kind of error, return the passed in defaults instead.
      return defaults
    }
  }
}

export default Store