'use strict'

const
    express = require('express'),
    app = express(),
    fs = require('fs'),
    formidable = require('formidable'),
    { execFile } = require('child_process')

app.use(express.static('public'))

app.post('/submit-form', (req, res) => {
    new formidable.IncomingForm().parse(req)
        .on('fileBegin', (_, file) => {
            file.path = __dirname + '/uploads/' + file.name
        })
        .on('file', (_, file) => {
            console.log('Uploaded file', file.path)
            const ext = file.path.split('.').pop().toUpperCase()
            console.log('ext ', ext)
            if (['TTF', 'OTF', 'EOT', 'SVG', 'WOFF'].includes(ext)) {
                execFile('/home/niels/bash/webfont.bash', [file.path],
                    (_, stdout) => {
                        console.log(stdout)
                        const zipName = file.name.split('.').slice(0, -1).join('.') + '.zip'
                        res.setHeader('Content-disposition', 'attachment; filename=' + zipName)
                        res.setHeader('Content-type', 'application/zip, application/octet-stream, application/x-zip-compressed, multipart/x-zip')
                        res.setHeader('Location', '/')
                        const
                            zipPath = file.path.split('/').slice(0, -1).join('/'),
                            readStream = fs.createReadStream(zipPath + '/' + zipName),
                            stream = readStream.pipe(res)
                        stream.on('finish', () => {
                            console.log('finished sending ' + zipName)
                            fs.unlink(zipPath + '/' + zipName, err => {
                                if (err) console.error(err)
                            })
                            fs.unlink(file.path, err => {
                                if (err) console.error(err)
                            })
                    })
                })
            }
        })
        .on('aborted', () => {
            console.error('Request aborted by the user')
        })
        .on('error', (err) => {
            console.error('Error', err)
            throw err
        })
        .on('end', () => {
            console.log('READY!')
        })
})

app.listen(9000)
