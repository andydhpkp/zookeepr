const fs = require('fs')
const path = require('path')

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
        path.join(__dirname, '../data/animals.json'),
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

module.exports = {
    filterByQuery,
    findById,
    createNewAnimal,
    validateAnimal
}