module.exports = {
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      removeElectronJunk: true,
      builderOptions: {
        appId: 'com.spring.app',
        productName: 'Spring',
        mac: {
          target: {
            target: 'zip', arch: 'arm64'
          }
        },
        win: {
          target: ['nsis']
        },
        electronDownload: {
          platform: 'darwin',
          arch: 'arm64'
        }
      }
    }
  }
}