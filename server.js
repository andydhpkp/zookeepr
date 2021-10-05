const apiRoutes = require('./router/apiRoutes')
const htmlRoutes = require('./router/htmlRoutes')

//These (fs and path [well, fs is necessary]) are necessary in order to actually make changes to animals.json
const fs = require('fs')
//path is another module built into the Node.js API that provides utilities for working with file and directory paths
const path = require('path')
const express = require('express')
//When heroku runs our app, it sets an environment variable called process.env.PORT, if it hasn't been set, it defaults to port 80
const PORT = process.env.PORT || 3001
const app = express()
//middleware that instructs the server to make certain files readily available and to not gate it behind a server endpoint (aka actually load all the routes without making the routes)
///the way this works is that we provide a file path to a location in our application (in this case, the public folder) and instruct the server to make these files static resources
app.use(express.static('public'))
//parse incoming string or array data
//the data needs to get parsed before it gets to the callback function in order for the server to accept the incoming data
//this method is built into Express.js. It takes incoming POST data and converts it to key/value pairings that can be accessed in the req.body object
//extended: true call informs our server that there may be sub-array data nested in the POST data, so it needs to look through as deeply as possible
app.use(express.urlencoded({ extended: true }))
//parse incoming JSON data into the req.body
//both of these app.use() middleware functions need to be set up every time you create a server that's looking to accept POST data
app.use(express.json())
app.use('/api', apiRoutes)
app.use('/', htmlRoutes)
//to request route that the front end can request data from
const { animals } = require('./data/animals.json')

//app.listen([port[, host[, backlog]]][, callback])
//ports with numbers 1024 and under are special according to the operating system
//PORT used to be 3001, better practice to set as variable to process.env.PORT
app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`)
});