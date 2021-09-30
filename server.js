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
//to request route that the front end can request data from
const { animals } = require('./data/animals.json')

//this was written after the .get(), but allows the filter functionality to be more clean and clear
//this function takes req.query and returns a new filtered array
function filterByQuery(query, animalsArray) {
    let personalityTraitsArray = []
    //Note that we save the animalsArray as filteredResults here:
    let filteredResults = animalsArray
    if (query.personalityTraits) {
        // Save personalityTraits as a dedicated array
        // If personalityTraits is a string, place it into a new array and save
        if (typeof query.personalityTraits === 'string') {
            personalityTraitsArray = [query.personalityTraits]
        } else {
            personalityTraitsArray = query.personalityTraits
        }
        //loop through each trait in the personalityTraits array:
        personalityTraitsArray.forEach(trait => {
            // Check the trait against each animal in filteredResults array 
            // remember, it is initially a copy of animalsArray
            // but here we're updating it for each trait in the .forEach() loop
            // For each trait being targeted by the filter, the filteredResults array will
            // then contain only the entries that contain the trait, so at the end we'll have
            // an array of animals that have every one of the traits when the .forEach() loop is done
            filteredResults = filteredResults.filter(
                animal => animal.personalityTraits.indexOf(trait) !== -1
            )
        })
    }
    if (query.diet) {
        filteredResults = filteredResults.filter(animal => animal.diet === query.diet)
    }
    if (query.species) {
        filteredResults = filteredResults.filter(animal => animal.species === query.species)
    }
    if (query.name) {
        filteredResults = filteredResults.filter(animal => animal.name === query.name)
    }
    return filteredResults
}

//function added for the :id GET route
function findById(id, animalsArray) {
    const result = animalsArray.filter(animal => animal.id === id)[0]
    return result
}

//a function that accepts the POST route's req.body value and the array we want to add the data to
//this function is executed in the app.post() route's callback function. When executed, it'll take the new animal data and add it to the animalsArray, then write the new array data to animals.json
//before we can send the data back to the route's callback function, we need to add something.......
///What we need to add is something that generates the id value on the server that knows what id values are already taken, so we update the app.post() with req.body.id = animals.length.toString()
//without const fs = require('fs'), nothing will change the actual animals.json, whenever require() is used to import data or functionality, it only reads the data and creates a copy of it to use on server.js
function createNewAnimal(body, animalsArray) {
    console.log(body)
    const animal = body
    animalsArray.push(animal)
    //necessary to actually write to animals.json. the Sync() version doesn't require a callback function. NOTE: if we were using a much larger data set, the asynchronous version would be better
    fs.writeFileSync(
        path.join(__dirname, './data/animals.json'),
        //This is to save the JavaScript array data as JSON. null and 2 are means of keeping our data formatted
        ///null means we don't want to edit any of our existing data (if we did, we could pass something here)
        ///2 indicates we want to create white space between our values to make it more readable
        JSON.stringify({ animals: animalsArray }, null, 2)
    )
    return animal
}

//function needed to validate that the new data from req.body has keys that not only exist, but is also the right type of data
function validateAnimal(animal) {
    if (!animal.name || typeof animal.name !== 'string') {
        return false;
    }
    if (!animal.species || typeof animal.species !== 'string') {
        return false
    }
    if (!animal.diet || typeof animal.diet !== 'string') {
        return false
    }
    if (!animal.personalityTraits || !Array.isArray(animal.personalityTraits)) {
        return false
    }
    return true
}

//Add the route called by const { animals }
//get() takes two arguments, string describing the route and a callback executed with each GET request
//send() method from the res (response) parameter to send the contents of send() to our client
//change send to json to send lots of JSON as opposed to short messages
//query parameter will be taken and turned into JSON
app.get('/api/animals', (req, res) => {
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
app.get('/api/animals/:id', (req, res) => {
    const result = findById(req.params.id, animals)
    //send a 404 error if requested resource cannot be found
    if (result) {
        res.json(result)
    } else {
        res.send(404)
    }
})

//the POST route
//this is another method of the app object that allows us to create routes
//POST requests differ from GET in that they represent the action of a client requesting the server to accept data rather than vice versa
//The best way to test a POST request is a fetch(), but you need a front end first, but we can use Insomnia Core to test without a front end
app.post('/api/animals', (req, res) => {
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

//this route has one job to do, to respond with an HTML page to display in the browser
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'))
})

//app.listen([port[, host[, backlog]]][, callback])
//ports with numbers 1024 and under are special according to the operating system
//PORT used to be 3001, better practice to set as variable to process.env.PORT
app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`)
});