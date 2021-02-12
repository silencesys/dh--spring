module.exports = {
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      removeElectronJunk: true,
      builderOptions: {
        appId: 'com.spring.app',
        productName: 'Spring',
        copyright: 'Copyright © 2021 Martin Roček',
        directories: {
          output: 'dist'
        },
        mac: {
          target: [
            { target: 'zip', arch: 'arm64' }
          ]
        },
        win: {
          target: ['zip', 'nsis']
        },
        linux: {
          target: ['zip']
        }
      }
    }
  }
}