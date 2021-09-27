const express = require('express')
//When heroku runs our app, it sets an environment variable called process.env.PORT, if it hasn't been set, it defaults to port 80
const PORT = process.env.PORT || 3001
const app = express()
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
/*this is a param route because it is adding that :id, so this is
important, WITH MULTIPLE ROUTES, A PARAM ROUTE MUST COME AFTER THE OTHER
GET ROUTE*/
//Why don't we just ust the filterByQuery() function from up there?
///We could, but we know with the :id that this will return a single animal
///therefore there is no need for all that extra code
app.get('/api/animals/:id', (req, res) => {
    const result = findById(req.params.id, animals)
    //send a 404 error if requested resource cannot be found
    if (result) {
        res.json(result)
    } else {
        res.send(404)
    }
})

//app.listen([port[, host[, backlog]]][, callback])
//ports with numbers 1024 and under are special according to the operating system
//PORT used to be 3001, better practice to set as variable to process.env.PORT
app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`)
});