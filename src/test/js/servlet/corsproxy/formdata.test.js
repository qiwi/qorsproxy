// https://github.com/qiwi/qorsproxy/issues/110
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Blob } from 'node:buffer'
import { FormData } from 'formdata-polyfill/esm.min.js'
import fetch from 'node-fetch-native'

import express from 'express'
import { expect } from 'chai'
import { Corsproxy } from '../../../../main/js/servlet/index.js'
import { Container } from '../../../../main/js/container/index.js'

const openAsBlob = fs.openAsBlob || (async (filePath) => {
  const buffer = await fs.promises.readFile(filePath)
  return new Blob([buffer])
})

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const filePath = path.resolve(__dirname, '../../../fixtures/test.xlsx')

const config = {
  "server": {
    "host": "127.0.0.1",
    "port": 8091
  },
  "rules": {
    "localhost": {
      "from": ["*"],
      "to": ["*"],
      "interceptions": [
        {
          "req": {
            "method": "OPTIONS"
          },
          "res": {
            "status": 200
          }
        }
      ],
      "mutations": [
        {
          "direction": "to",
          "headers": [
            {
              "name": "host",
              "value": null
            },
            {
              "name": "origin",
              "value": "http://localhost"
            }
          ]
        },
        {
          "direction": "from",
          "headers": [
            {
              "name": "transfer-encoding",
              "value": null
            }
          ]
        },
        {
          "direction": "from",
          "headers": [
            {
              "name": "set-cookie",
              "value": {
                "from": "/;Domain.+;/i",
                "to": ";Domain: localhost;"
              }
            }
          ]
        }
      ]
    }
  }
}



const remote = express()
  .post('/upload', (req, res) => {
    res
      .status(200)
      .send(req.headers)
  })

async function uploadFile({filePath, url}) {
  const file = await openAsBlob(filePath)
  const formData = new FormData()
  formData.set('file', file, 'file_name.ext')

  return fetch(url, {
    method: 'POST',
    body: formData,
    headers: {
      connection: 'keep-alive',
      'accept-language': '*',
      'sec-fetch-mode': 'cors',
      'user-agent': 'node',
      'accept-encoding': 'gzip, deflate'
    }
  })
}

describe('formdata', () => {
  it('should pipe formdata', async () => {
    const server = await remote.listen(8090)
    const proxy = await (await new Container()
      .configure({
        ...config.server,
        servlets: {
          '': new Corsproxy().configure({ rules: config.rules })
        }
      }))
      .start()
    const url = 'http://localhost:8091/http://localhost:8090/upload'
    const response = await uploadFile({filePath, url})
    const { status } = response
    const headers = await response.json()
    const extectedHeaders = {
      host: 'localhost:8090',
      connection: 'keep-alive',
      // 'content-type': 'multipart/form-data; boundary=----formdata-undici-051446473976',
      accept: '*/*',
      'accept-language': '*',
      'sec-fetch-mode': 'cors',
      'user-agent': 'node',
      'accept-encoding': 'gzip, deflate',
      // 'content-length': '214'
    }

    expect(headers).to.include(extectedHeaders)
    expect(status).to.equal(200)

    await server.close()
    await proxy.stop()
  })
})
