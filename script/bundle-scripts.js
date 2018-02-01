/*
A module/command line tool that bundles the client scripts in the project.
*/

import * as fs from 'fs'
import * as path from 'path'
import * as EventEmitter from 'events'
import browserify from 'browserify'
import tsify from 'tsify'
import watchify from 'watchify'
import exorcist from 'exorcist'
import uglifyify from 'uglifyify'
import UglifyJs from 'uglify-js'
import mkdirp from 'mkdirp'

/*
The bundle targets where a target object has the following shape
{
  outFile: string,
  entries?: string[], // Expected if require is not specified
  external?: Array<string>,
  require?: Array<string | { file: string, expose?: boolean }>,
  ignore?: string[],
  exclude?: string[]
}
*/
const targets = [
  {
    outFile: 'dist/static/bundle.js',
    // Entry files to include in the bundle (and their deps)
    entries: [ './lib/index.js' ]
  }
]

function bundleTarget (target, { debug = false, minify = false, watch = false } = {}) {
  const { entries, outFile, external, require, ignore, exclude } = target

  if (!outFile || typeof outFile !== 'string') {
    throw new Error('Target outFile invalid: outFile = ' + outFile)
  }

  const b = browserify({
    entries,
    debug,
    cache: {},
    packageCache: {}
  })

  if (Array.isArray(require)) {
    require.forEach(x => {
      b.require(x.file || x, x.opts || undefined)
    })
  }

  if (Array.isArray(external)) {
    b.external(external)
  }

  if (Array.isArray(ignore)) {
    b.ignore(ignore)
  }

  if (Array.isArray(exclude)) {
    b.exclude(exclude)
  }

  b.plugin(tsify)

  if (minify) {
    b.transform(uglifyify)
  }

  if (watch) {
    // See: https://www.npmjs.com/package/watchify#options
    b.plugin(watchify, {
      delay: 100
    })
  }

  const emitter = new EventEmitter()

  b.on('update', () => {
    const s = new Date().getTime()
    bundle().then(() => {
      const dt = new Date().getTime() - s
      emitter.emit('complete', dt)
    }).catch(error => {
      emitter.emit('error', error)
      return Promise.reject(error)
    })
  })

  return [
    path.dirname(outFile),
    path.dirname(outFile + '.map')
  ].reduce((p, d) => {
    return p.then(() => mkdir(d))
  }, Promise.resolve()).then(() => bundle()).then(() => emitter)

  function bundle() {
    return new Promise((resolve, reject) => {
      let p = b.bundle()
      let resolved = false

      if (debug) {
        p = p.pipe(exorcist(outFile + '.map'))
      }

      p.pipe(fs.createWriteStream(outFile, 'utf8'))
        .on('error', error => {
          if (!resolved) {
            resolved = true
            reject(error)
          }
        })
        .on('close', () => {
          if (!resolved) {
            resolved = true
            if (minify) {
              uglify(outFile, debug ? outFile + '.map' : null)
                .then(() => resolve(), reject)
            } else {
              resolve()
            }
          }
        })
    })
  }
}

function mkdir (dirName) {
  return new Promise((resolve, reject) => {
    mkdirp(dirName, error => error ? reject(error) : resolve())
  })
}

function readFile (fileName) {
  return new Promise((resolve, reject) => {
    fs.readFile(fileName, 'utf8', (error, text) => {
      error ? reject(error) : resolve(text)
    })
  })
}

function writeFile (fileName, content) {
  return new Promise((resolve, reject) => {
    fs.writeFile(fileName, content, 'utf8', (error) => {
      error ? reject(error) : resolve()
    })
  })
}

function uglify (sourceFile, sourceMapFile = null) {
  return Promise.all([
    readFile(sourceFile),
    sourceMapFile
      ? readFile(sourceMapFile)
      : null
  ]).then(([ code, sourceMap ]) => {
    const sourceMapOpts = sourceMap
      ? {
        content: sourceMap,
        // Assume the source map will be saved next to the uglified file
        url: path.basename(sourceMapFile)
      }
      : undefined
    const result = UglifyJs.minify({ [path.basename(sourceFile)]: code }, {
      sourceMap: sourceMapOpts
    })

    return Promise.all([
      writeFile(sourceFile, result.code),
      result.map
        ? writeFile(sourceMapFile, result.map)
        : null
    ])
  })
}

export default function bundleTargets (targets, { minify = false, debug = false, watch = false } = {}) {
  return Promise.all(
    targets.map(t => {
      const start = new Date().getTime()
      console.log(
        '[', t.outFile, ']', 'bundle-scripts started'
      )

      return bundleTarget(t, { minify, debug, watch }).then(emitter => {
        const dt = new Date().getTime() - start
        const seconds = (dt / 1000).toFixed(2)

        console.log(
          '[', t.outFile, ']', 'bundle-scripts completed in', seconds, 'seconds'
        )

        emitter.on('complete', dt => {
          const seconds = (dt / 1000).toFixed(2)
          console.log(
            '[', t.outFile, ']', 'bundle-scripts completed in', seconds, 'seconds'
          )
        })
        emitter.on('error', error => {
          console.error(error)
        })

        return emitter
      })
    })
  )
}

// The CLI
// Usage: bundle-scripts [--minify] [--watch] [--debug]
if (require.main === module) {
  bundleTargets(targets, {
    debug: process.argv.includes('--debug'),
    minify: process.argv.includes('--minify'),
    watch: process.argv.includes('--watch')
  }).catch(error => console.error(error))
}
