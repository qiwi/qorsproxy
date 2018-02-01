/*
A module/command line tool that bundles the client styles in the project.
*/

import * as path from 'path'
import * as fs from 'fs'
import mkdirp from 'mkdirp'
import sass from 'node-sass'
import CleanCss from 'clean-css'
import less from 'less'

const targets = [
  {
    entries: [ 'less/styles.less' ],
    outFile: 'dist/static/style.css',
    includePaths: [ 'less' ]
  }
]

function compile (entries, outFile, { includePaths = [], sourceMap = false } = {}) {
  return Promise.all(
    entries.map(fileName => {
      const ext = path.extname(fileName)

      switch (ext) {
        // Vanilla .css files
        case '.css':
          return new Promise((resolve, reject) => {
            fs.readFile(fileName, 'utf8', (error, styles) => {
              error ? reject(error) : resolve({ styles, fileName })
            })
          })
        // SASS files
        case '.scss':
        case '.sass':
          return new Promise((resolve, reject) => {
            sass.render({
              file: fileName,
              includePaths,
              sourceMap: sourceMap ? outFile + '.map' : undefined,
              sourceMapContents: true,
              omitSourceMapUrl: true,
              outFile: path.join(
                path.dirname(outFile), path.basename(fileName)
              ),
              outputStyle: 'expanded',
              precision: 5
            }, (error, result) => {
              if (error) {
                reject(error)
              } else {
                resolve({
                  styles: result.css.toString(),
                  fileName,
                  map: result.map ? result.map.toString() : null
                })
              }
            })
          })
        // Less files
        case '.less':
          return new Promise((resolve, reject) => {
            fs.readFile(fileName, 'utf8', (error, lessInput) => {
              error ? reject(error) : resolve(lessInput)
            })
          }).then(lessInput => {
            return less.render(lessInput, {
              filename: fileName,
              paths: includePaths,
              sourceMap: sourceMap
                ? {
                  sourceMapFileInline: false,
                  outputSourceFiles: true,
                  outputFilename: path.join(
                    path.dirname(outFile), path.basename(fileName)
                  )
                }
                : null
            })
          }).then(output => {
            console.log(output)
            return { fileName, styles: output.css, map: output.map }
          })
        // Unsupported files
        default:
          return Promise.reject(
            new Error(`Unsupported stylesheet ${fileName}`)
          )
      }
    })
  )
}

function bundle (compileResult, outFile, { minify = false, sourceMap = false } = {}) {
  const css = new CleanCss({
    format: minify ? false : 'beautify',
    inline: [ 'local' ],
    level: minify ? 1 : 0,
    rebase: false,
    sourceMap,
    sourceMapInlineSources: true,
    returnPromise: true
  })

  const src = compileResult.reduce((src, r) => {
    src[r.fileName] = { styles: r.styles, sourceMap: r.map }
    return src
  }, {})

  return css.minify(src)
    .then(output => {
      if (output.errors && output.errors.length) {
        return Promise.reject(new Error(
          output.errors.join('\n---\n')
        ))
      } else {
        if (output.warnings && output.warnings.length) {
          console.warn(output.warnings.join('\n'))
        }
        return new Promise((resolve, reject) => {
          mkdirp(path.dirname(outFile), error => {
            error ? reject(error) : resolve()
          })
        }).then(() => {
          let styles = output.styles

          if (output.sourceMap) {
            styles +=
              `\n/*# sourceMappingURL=${path.basename(outFile + '.map')} */`
          }

          return Promise.all([
            new Promise((resolve, reject) => {
              fs.writeFile(outFile, styles, 'utf8', error => {
                error ? reject(error) : resolve()
              })
            }),
            output.sourceMap && new Promise((resolve, reject) => {
              fs.writeFile(
                outFile + '.map',
                output.sourceMap.toString(),
                'utf8',
                error => error ? reject(error) : resolve()
              )
            })
          ])
        })
      }
    })
}

export default function bundleTargets (targets, { minify = false, sourceMap = false } = {}) {
  return Promise.all(
    targets.map(t => {
      const start = new Date().getTime()
      console.log(
        '[', t.outFile, ']', 'bundle-styles started'
      )

      return compile(t.entries, t.outFile, { includePaths: t.includePaths, sourceMap })
        .then(compileResult => {
          return bundle(compileResult, t.outFile, { minify, sourceMap })
        }).then(() => {
          const dt = new Date().getTime() - start
          const seconds = (dt / 1000).toFixed(2)

          console.log(
            '[', t.outFile, ']', 'bundle-styles completed in', seconds, 'seconds'
          )
        })
    })
  )
}

// The CLI
// Usage: bundle-styes [--minify] [--debug]
if (require.main === module) {
  bundleTargets(targets, {
    minify: process.argv.includes('--minify'),
    sourceMap: process.argv.includes('--debug')
  }).catch(error => console.error(error))
}
