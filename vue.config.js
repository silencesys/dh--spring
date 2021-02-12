module.exports = {
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      removeElectronJunk: true,
      builderOptions: {
        appId: 'com.spring.app',
        productName: 'Spring',
        copyright: 'Copyright © 2021 Martin Roček',
        artifactName: '${name}-${version}-${os}-${platform}-${arch}.${ext}',
        directories: {
          output: 'dist/'
        },
        publish: {
          provider: 'github',
          releaseType: ['release', 'prerelease']
        },
        mac: {
          target: [
            { target: 'tar.gz', arch: 'arm64' },
            { target: 'tar.gz', arch: 'x64' }
          ],
          darkModeSupport: true
        },
        win: {
          target: ['zip', 'nsis']
        }
      }
    }
  }
}