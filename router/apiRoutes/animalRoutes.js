const { filterByQuery, findById, createNewAnimal, validateAnimal } = require('../../lib/animals')
const { animals } = require('../../data/animals.json')
const router = require('express').Router()

//Add the route called by const { animals }
//get() takes two arguments, string describing the route and a callback executed with each GET request
//send() method from the res (response) parameter to send the contents of send() to our client
//change send to json to send lots of JSON as opposed to short messages
//query parameter will be taken and turned into JSON
router.get('/animals', (req, res) => {
    let results = animals
    if (req.query) {
        results = filterByQuery(req.query, results)
    }
    res.send(results)
})

//GET route for animals with :id added
//this is a param route because it is adding that :id, so this is important, WITH MULTIPLE ROUTES, A PARAM ROUTE MUST COME AFTER THE OTHER GET ROUTE
//Why don't we just ust the filterByQuery() function from up there?
///We could, but we know with the :id that this will return a single animal, therefore there is no need for all that extra code
router.get('/animals/:id', (req, res) => {
    const result = findById(req.params.id, animals)
    //send a 404 error if requested resource cannot be found
    if (result) {
        res.json(result)
    } else {
        res.send(404)
    }
})

//the POST route
//this is another method of the router object that allows us to create routes
//POST requests differ from GET in that they represent the action of a client requesting the server to accept data rather than vice versa
//The best way to test a POST request is a fetch(), but you need a front end first, but we can use Insomnia Core to test without a front end
router.post('/animals', (req, res) => {
    //req.body is where we can access data on the server side and do something with it
    console.log(req.body)
    //updated post route for adding id's
    req.body.id = animals.length.toString()

    //if any data in req.body is incorrect, send 400 error back
    if (!validateAnimal(req.body)) {
        //response method to relay a message to the client making the request. Anything in the 400 range means that it's a user error and not a server error
        res.status(400).send('The animal is not properly formatted.')
    } else {
        //add animal to json file and animals array in this function
        const animal = createNewAnimal(req.body, animals)
        //res.json() sends the data back to the client
        res.json(req.body)
    }

})

module.exports = router