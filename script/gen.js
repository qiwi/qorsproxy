/*
A module/command line tool that renders named templates, typically used as a
generator for the project.
*/

import * as fs from 'fs'
import * as path from 'path'
import mkdirp from 'mkdirp'
import copy from 'copy'
import consolidate from 'consolidate'
import deepExtend from 'deep-extend'

/**
 * Attempts to render a generator template with the specified context object.
 * Each property on the context's local object will be accessible to the
 * template being rendered as a global property.
 *
 * If the template name is a directory then every file in the directory will be
 * rendered as a template.
 *
 * All templates are expected to follow this file naming rule:
 *
 *    templatefile.format.extension
 *
 * Where `format` is the format of the template and `extension` is the file
 * extension to use when writing the rendered template.
 *
 * For template files that do not have a `format` in the file name they will not
 * be rendered, but instead return just the path to the template.
 *
 * @param {string} templatePath The template or directory of templates to render
 * @param {Object} locals The context object to pass to the template
 * @param {Object} options The options used to alter the render
 * @return {Promise<{ text?: string, path: string, context: { config: { basePath?: string, srcBase: string, destPaths?: { [fileName:string]: string } }, locals: Object }, format: string, extname: string }[]>} The render results
 */
export function renderTemplate (templatePath, locals) {
  return stat(templatePath).then(stats => {
    if (stats.isDirectory()) {
      return renderTemplateDirectory(templatePath, templatePath, locals)
    } else if (stats.isFile()) {
      const context = {
        config: { srcBase: path.dirname(templatePath) },
        locals
      }
      return renderTemplateFile(templatePath, context).then(r => [ r ])
    } else {
      return Promise.reject(new Error('Unsupported template: ' + templatePath))
    }
  }).catch(error => {
    if (error.code === 'ENOENT') {
      return Promise.reject(new Error('Template not found: ' + templatePath))
    } else {
      return Promise.reject(error)
    }
  })
}

/**
 * Retrieve the fs.Stats for a file.
 *
 * @param {string} fileName
 * @return {Promise<fs.Stats>}
 */
function stat (fileName) {
  return new Promise((resolve, reject) => {
    fs.stat(fileName, (error, stats) => {
      error ? reject(error) : resolve(stats)
    })
  })
}

/**
 * Recursively renders all templates in a directory.
 *
 * @param {string} dirPath The directory to render
 * @param {string} srcBase The src base directory
 * @param {Object} locals The locals object
 * @return {Promise<{ text?: string, path: string, context: { config: { basePath?: string, srcBase: string, destPaths?: { [fileName:string]: string } }, locals: Object }, format: string, extname: string }[]>}
 */
function renderTemplateDirectory (dirPath, srcBase, locals) {
  return readdir(dirPath).then(files => {
    files = files.filter(f => f !== '.context.json' && f !== '.context.js')

    return files.reduce((p, file) => {
      file = path.resolve(dirPath, file)

      return p.then(results => {
        return stat(file).then(stats => {
          if (stats.isDirectory()) {
            return renderTemplateDirectory(file, srcBase, locals).then(r => {
              return results.concat(r)
            })
          } else {
            return loadContext(dirPath, srcBase, locals).then(ctx => {
              return renderTemplateFile(file, ctx).then(r => {
                return results.concat(r)
              })
            })
          }
        })
      })
    }, Promise.resolve([]))
  })
}

/**
 * Lists all files in a directory.
 *
 * @param {string} dirPath
 * @return {Promise<string[]>}
 */
function readdir (dirPath) {
  return new Promise((resolve, reject) => {
    fs.readdir(dirPath, (error, files) => {
      error ? reject(error) : resolve(files)
    })
  })
}

/**
 * Renders a template at the specified path. If the template has no template
 * format then just returns a path to the template.
 *
 * @param {string} templatePath The template to render
 * @param {{ config: Object, locals: Object }} context The context to render with
 * @return {Promise<{ text?: string, path: string, context: { config: { basePath?: string, srcBase: string, destPaths?: { [fileName:string]: string } }, locals: Object }, format: string, extname: string }>}
 */
function renderTemplateFile (templatePath, context) {
  const { format, extname } = getTemplateTypeData(templatePath)
  context = context || { config: {}, locals: {} }

  if (!format) {
    // If the template file name does not have a template format then we just
    // copy the file verbatum. This could be a folder.
    return readFile(templatePath).then(data => {
      return { path: templatePath, context, extname }
    })
  } else if (typeof consolidate[format] === 'function') {
    // Disable template caching.
    const locals = Object.assign({}, context.locals, { cache: false })
    return consolidate[format](templatePath, locals).then(text => {
      return { text, path: templatePath, context, format, extname }
    })
  } else {
    throw new Error(
      'Unsupported template format: ' + templatePath +
      '\nYou may need to install a module for it. ' +
      'See https://www.npmjs.com/package/consolidate ' +
      'for supported template formats.'
    )
  }
}

/**
 * Retrieves the path extension names of a file path.
 *
 * @param {string} fileName
 * @return {{ extname: string, format: string }}
 */
function getTemplateTypeData (templateName) {

  const extname = path.extname(templateName)
  let format = path.extname(templateName.slice(0, -extname.length))

  if (format) {
    format = format.slice(1)
  }

  return { extname, format }
}

/**
 * Reads a file.
 *
 * @param {string} fileName
 * @return {any}
 */
function readFile (fileName) {
  return new Promise((resolve, reject) => {
    fs.readFile(fileName, 'utf8', (error, data) => {
      error ? reject(error) : resolve(data)
    })
  })
}

/**
 * Writes a file.
 *
 * @param {string} fileName
 * @param {any} content
 * @return {Promise<void>}
 */
function writeFile (fileName, content) {
  return new Promise((resolve, reject) => {
    mkdirp(path.dirname(fileName), error => {
      error ? reject(error) : resolve()
    })
  }).then(() => {
    return new Promise((resolve, reject) => {
      fs.writeFile(fileName, content, 'utf8', error => {
        error ? reject(error) : resolve()
      })
    })
  })
}

/**
 * Writes template render result.
 *
 * By default all rendered templates will be saved to the current working
 * directory, but this can be overridden by providing a `_config.json` file in
 * the directory of the template. This config file can provide a new default
 * basePath (defaults to `'.'`) and/or specific destPaths for a file in the
 * directory.
 *
 * Example:
 * // my-generator/_config.json
 * {
 *  "basePath": "src",
 *  "myTemplate.ejs.html": "somedir"
 * }
 * // my-generator/myTemplate.ejs.html
 * blah
 *
 * This would cause the template `myTemplate.ejs.html` to be written to
 * `src/somedir/myTemplate.html`.
 *
 * @param {{ text?: string, path: string, context: { config: { basePath?: string, srcBase: string, destPaths?: { [fileName:string]: string } } , locals: Object }, format: string, extname: string }[]} renderResult Template renderer results
 */
export function writeTemplateRenderResults (renderResult) {
  return Promise.all(
    renderResult.map(renderedFileObj => {
      const { path: templatePath, context } = renderedFileObj
      const { config, locals = {} } = context
      const { srcBase, destPaths } = config
      let baseName = path.basename(templatePath)
      // Find the key in the config that matches our template either using
      // strict equality or RegExp.
      const templateDestPathKey = Object.keys(destPaths || {})
        .find(key => {
          return key === baseName ||
            new RegExp(key.replace(/^\/|\/$/g, '')).test(templatePath)
        })

      if (renderedFileObj.text) {
        baseName = path.basename(
          path.basename(baseName, renderedFileObj.extname),
          '.' + renderedFileObj.format
        ) + renderedFileObj.extname

        const destFileName = path.resolve(
            config.basePath || '.',
            expandeESTemplateString(
              destPaths[templateDestPathKey] || baseName,
              Object.assign({}, renderedFileObj.context.locals, { baseName })
            )
          )

        return writeFile(destFileName, renderedFileObj.text)
      } else {
        const destPath = path.resolve(
          config.basePath || '.',
          expandeESTemplateString(
            destPaths[templateDestPathKey] || '',
            Object.assign({}, renderedFileObj.context.locals, { baseName })
          )
        )

        // Just copy the file as-is
        return new Promise((resolve, reject) => {
          copy.one(templatePath, destPath, { srcBase }, error => {
            error ? reject(error) : resolve()
          })
        })
      }
    })
  )
}

const contextCache = {}
/**
 * Attempts to load a context file for the specified template path. Loads all
 * context files found up until src base path is reached and merged each config
 * JSON into one another.
 *
 * @param {string} cwd The working directory
 * @param {string} srcBase The src base path
 * @param {Object} [locals] The optional object to pass to any config factory modules
 * @return {Promise<{ config: { basePath?: string, srcBase: string, destPaths?: { [fileName:string]: string } }, locals: Object }>} The merged config
 */
function loadContext (cwd, srcBase, locals = {}) {
  const contextLocations = generateContextFileLocations(cwd, srcBase)

  return Promise.all(
    contextLocations.map(l => stat(l).catch(() => null))
  ).then(list => {
    return list.map((x, index) => {
      return x === null ? null : contextLocations[index]
    }).filter(x => x !== null)
  }).then(contextFileNames => {
    return contextFileNames.reduce((p, contextFileName) => {
      return p.then(context => {
        return (contextCache[contextFileName]
          ? Promise.resolve(contextCache[contextFileName])
          : (
            contextFileName.endsWith('.json')
              ? readFile(contextFileName).then(text => JSON.parse(text))
              : import(contextFileName)
          )
        ).catch(error => {
          if (error.code === 'ENOENT' || error.code === 'MODULE_NOT_FOUND') {
            return Promise.resolve({})
          } else {
            return Promise.reject(error)
          }
        }).then(ctx => {
          if (typeof ctx === 'function') {
            return Promise.resolve(ctx(locals))
          } else {
            return ctx
          }
        })
        .then(ctx => {
          contextCache[contextFileName] = ctx
          return deepExtend({}, context, ctx)
        })
      })
    }, Promise.resolve({})).then(context => {
      return deepExtend({}, { config: {}, locals }, context, { config: { srcBase } })
    })
  })
}

/**
 * List all the possible paths for a .context.js or a .context.json file given the
 * specified template path and src base.
 *
 * @param {string} cwd The working directory
 * @param {string} srcBase The src base path
 * @return {string[]}
 */
function generateContextFileLocations (cwd, srcBase) {
  const locations = []
  const baseNames = [ '.context.js', '.context.json' ]

  locations.push(
    ...baseNames.map(b => path.join(cwd, b))
  )

  while (cwd && cwd !== srcBase && cwd.length > srcBase.length) {
    cwd = path.dirname(cwd)
    locations.push(
      ...baseNames.map(b => path.join(cwd, b))
    )
  }

  return locations
}

/**
 * Expands a string with ES Template tags of the form ${key}.
 *
 * @param {string} str The string to expand
 * @param {Object} context The context to use in the expansion
 * @return {string}
 */
function expandeESTemplateString (str, context) {
  return str.replace(/\$\{([^}]+)\}/g, (_, key) => {
    if (key in context) {
      return context[key]
    } else {
      return ''
    }
  })
}

/**
 * Renders and writes a template or folder of templates.
 *
 * @param {string} templateName The template or folder to render
 * @param {Object} context The context to render with
 * @param {Object} options The options
 */
export default function gen (templateName, context, { templatesDirPath = 'templates' } = {}) {
  templateName = path.resolve(templatesDirPath, templateName)
  return renderTemplate(templateName, context).then(results => {
    return writeTemplateRenderResults(results)
  })
}

// The CLI
// Usage: gen {template-name} [args]
// Can also accept JSON text piped to stdin that will be merged with the context
// object. The args will be sved to the context object.
//
// Examples:
//  node -r @std/esm gen my-generator --name MyName --protected
//  cat file.json | node -r @std/esm gen my-generator --name MyName --protected
if (require.main === module) {
  const args = process.argv.slice(2)
  const [ templateName, ...rest ] = args
  const normalizedArgs = [].concat(...rest.map(x => {
    return x.startsWith('-') ? x.split('=') : x
  }))

  let context = {}
  while (normalizedArgs.length) {
    if (normalizedArgs[0].startsWith('-')) {
      let prop = normalizedArgs.shift()
      let value = 'null'

      if (!normalizedArgs[0] || normalizedArgs[0].startsWith('-')) {
        value = 'true'
      } else {
        value = normalizedArgs.shift()
      }

      prop = prop.replace(/^-+/, '')

      try {
        context[prop] = JSON.parse(value)
      } catch (_) {
        context[prop] = value
      }
    } else {
      normalizedArgs.shift()
    }
  }

  const doWork = context => {
    gen(templateName, context).then(() => {
      console.log(`Template rendered: ${templateName}`)
    }).catch(error => {
      console.error(error)
    })
  }

  // Undocumented property is only false when there is no input piped into stdin
  if (process.stdin.isRaw === false) {
    doWork(context)
  } else {
    const buff = []
    process.stdin.once('close', () => {
      process.stdin.removeListener('data', onData)
      context = deepExtend(
        {},
        JSON.parse(buff.join('')),
        context
      )
      doWork(context)
    })
    const onData = data => {
      buff.push(data)
    }
    process.stdin.on('data', onData)
  }
}
