/*
A module/command line tool to copy the project's static files.
*/

import copy from 'copy'

// The copy tasks, where each task has an array of glob patterns
// to copy into a dest directory. The patterns will be fully qualified
// before they are copied (i.e. lib/* will copy the entire lib folder).
const tasks = [
  {
    dest: 'dist',
    patterns: [
      'package.json',
      'npm-shrinkwrap.json',
      'lib/*',
      'static/*'
    ]
  }
]

export default function cp () {
  return tasks.reduce((p, task) => {
    return p.then(() => {
      return doCopy(task.patterns, task.dest)
    })
  }, Promise.resolve())
}

function doCopy (patterns, dest) {
  return new Promise((resolve, reject) => {
    copy(patterns, dest, error => error ? reject(error) : resolve())
  })
}

// The CLI
// Usage: copy
if (require.main === module) {
  const start = new Date().getTime()
  cp().then(() => {
    const dt = new Date().getTime() - start
    const seconds = (dt / 1000).toFixed(2)
    console.log('copy task completed in', seconds, 'seconds')
  }).catch(error => console.error(error))
}
