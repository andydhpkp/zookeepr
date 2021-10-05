const path = require('path')
const router = require('express').Router()

//this route has one job to do, to respond with an HTML page to display in the browser
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'))
})

//this route will take us to /animals
router.get('/animals', (req, res) => {
    res.sendFile(path.join(__dirname, './public/animals.html'))
})

//this route will take us to /zookeepers
router.get('/zookeepers', (req, res) => {
    res.sendFile(path.join(__dirname, './public/zookeepers.html'))
})

//this route allows us to take requests that do not exist and reroute them wherever we want
///MAKE SURE THIS ROUTE COMES LAST OR EVERYTHING UNDER WILL GO HERE
router.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'))
})

module.exports = router