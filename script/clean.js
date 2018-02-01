/*
A module/command line tool to remove generated fils and folders in the project.
*/

import rimraf from 'rimraf'

// Files and/or glob patterns to remove
const patterns = [
  'coverage',
  '.nyc_output',
  '.esm-cache',
  'coverage.lcov',
  'dist'
]

export default function clean () {
  return patterns.reduce((p, pattern) => {
    return p.then(() => remove(pattern))
  }, Promise.resolve())
}

function remove (pattern) {
  return new Promise((resolve, reject) => {
    rimraf(pattern, error => error ? reject(error) : resolve())
  })
}

// The CLI
// Usage: clean
if (require.main === module) {
  const start = new Date().getTime()
  clean().then(() => {
    const dt = new Date().getTime() - start
    const seconds = (dt / 1000).toFixed(2)
    console.log('clean task completed in', seconds, 'seconds')
  }).catch(error => console.error(error))
}
