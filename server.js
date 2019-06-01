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
        .on('field', (name, field) => {
            console.log('Field', name, field)
        })
        .on('fileBegin', (_, file) => {
            file.path = __dirname + '/uploads/' + file.name
        })
        .on('file', (_, file) => {
            console.log('Uploaded file', file.path)
            execFile('/home/niels/bash/webfont.bash', [file.path],
                (_, stdout) => {
                    console.log(stdout)
                    const
                        zipName = file.name.split('.').slice(0, -1).join('.') + '.zip',
                        zipPath = file.path.split("/").slice(0,-1).join("/"),
                        readStream = fs.createReadStream(zipPath + '/' + zipName)
                    res.setHeader('Content-disposition', 'attachment; filename=' + zipName)
                    res.setHeader('Content-type', 'application/zip, application/octet-stream, application/x-zip-compressed, multipart/x-zip')
                    readStream.pipe(res);
            })
        })
        .on('aborted', () => {
            console.error('Request aborted by the user')
        })
        .on('error', (err) => {
            console.error('Error', err)
            throw err
        })
})

app.listen(9000)
