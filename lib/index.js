const fs = require('fs')
const path = require('path')
const pdf = require('pdf-page-counter')
const { getAllFiles } = require('get-all-files')

let filesToRename = 0
let renameSuccess = 0
let renameFail = 0

exports.prefixPDFs = async (dir) => {
  filesToRename = 0
  renameSuccess = 0
  renameFail = 0
  for await (const filename of getAllFiles(dir)) {
    if (path.extname(filename).toLowerCase() === '.pdf') {
      filesToRename++
      const pdfData = fs.readFileSync(filename)
      const pathInfo = path.parse(filename)
      pdf(pdfData).then(({ numpages }) => {
        if (numpages >= 0) {
          const prefixed = `${pathInfo.dir}\\${numpages}-${pathInfo.base}`
          fs.rename(filename, prefixed, (error) => {
            if (error) {
              console.log('Error renaming', `"${pathInfo.base}"`)
              renameFail++
            } else {
              console.log('Prefixed:', `"${pathInfo.base}" (${numpages} pages)`)
              renameSuccess++
            }
            finishRename()
          })
        } else {
          console.log('Error renaming', `"${pathInfo.base}"`)
          renameFail++
          finishRename()
        }
      })
    }
  }
}

function finishRename() {
  if (renameSuccess + renameFail === filesToRename) {
    if (renameSuccess > 0) console.log(renameSuccess, 'files prefixed!')
    if (renameFail > 0) console.log(renameFail, 'files failed to be prefixed!')
  }
}
