module.exports = {
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      removeElectronJunk: true,
      builderOptions: {
        appId: 'com.spring.app',
        productName: 'Spring',
        copyright: 'Copyright © 2021 Martin Roček',
        artifactName: '${name}-${version}-${os}-${arch}.${ext}',
        directories: {
          output: 'dist/'
        },
        publish: {
          provider: 'github',
          releaseType: 'draft'
        },
        mac: {
          target: [
            { target: 'tar.gz', arch: 'arm64' },
            // { target: 'tar.gz', arch: 'x64' }
          ],
          darkModeSupport: true,
          category: 'public.app-category.productivity'
        },
        win: {
          target: ['zip', 'nsis']
        }
      }
    }
  }
}