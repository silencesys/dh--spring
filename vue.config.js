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
            { target: 'zip', arch: 'arm64' },
          ],
          publish: ['github']
        },
        win: {
          target: ['zip', 'nsis'],
          publish: ['github']
        }
      }
    }
  }
}