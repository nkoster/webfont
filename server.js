'use strict'

const
    express = require('express'),
    app = express(),
    formidable = require('formidable')

app.use(express.static('public'))

app.post('/submit-form', (req, res) => {
    new formidable.IncomingForm().parse(req)
      .on('field', (name, field) => {
        console.log('Field', name, field)
      })
      .on('fileBegin', (_, file) => {
          file.path = __dirname + '/uploads/' + file.name
      })
      .on('file', (name, file) => {
        console.log('Uploaded file', file.name)
      })
      .on('aborted', () => {
        console.error('Request aborted by the user')
      })
      .on('error', (err) => {
        console.error('Error', err)
        throw err
      })
      .on('end', () => {
        res.end()
      })
})
app.listen(9000)
