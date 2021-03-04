function init() {
  const versionSpan = document.createElement('span')
  const version = process.env.VERSION
  if (version) {
    versionSpan.innerHTML = version.replace(/"/g, '')
    versionSpan.style.position = 'fixed'
    versionSpan.style.bottom = 0
    versionSpan.style.right = 0
    versionSpan.style.color = '#bfbfbf'
    const body = document.getElementsByTagName('body')[0]
    if (body) {
      body.appendChild(versionSpan)
    }
  }
}

init()
