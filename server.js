'use strict'

const
    express = require('express'),
    app = express(),
    fs = require('fs'),
    formidable = require('formidable'),
    { execFile } = require('child_process')

app.use(express.static('public'))

app.post('/get-zip', (req, res) => {
    new formidable.IncomingForm().parse(req)
        .on('fileBegin', (_, file) => {
            file.path = __dirname + '/uploads/' + file.name
        })
        .on('file', (_, file) => {
            console.log('Uploaded file', file.path)
            const ext = file.path.split('.').pop().toUpperCase()
            if (['TTF', 'OTF', 'EOT', 'SVG', 'WOFF'].includes(ext)) {
                execFile('/home/niels/bash/webfont.bash', [file.path],
                    (_, stdout) => {
                        console.log(stdout)
                        const zipName = file.name.split('.').slice(0, -1).join('.') + '.zip'
                        res.setHeader('Content-disposition', 'attachment; filename=' + zipName)
                        res.setHeader('Content-type', 'application/zip, application/octet-stream, application/x-zip-compressed, multipart/x-zip')
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
            } else {
                fs.unlink(file.path, err => {
                    if (err) console.error(err)
                })
                res.redirect('/')
            }
        })
        .on('error', (err) => {
            console.error('Error', err)
            throw err
        })
        .on('end', () => {
            console.log('Finished')
        })
})

app.listen(9000)
