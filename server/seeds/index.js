const fetch = require('node-fetch')
const { type } = require('os')
const connection = require('../config/connection')
const {Trainer, Pokemon} = require('../models')

connection.once('open', async () => {
    // delete existing data
    await Trainer.deleteMany()
    await Pokemon.deleteMany()
    // seed pokemon
    for (const id of [1, 4, 7]) {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
        const { 
            id: pokemonId, 
            name, 
            moves, 
            height, 
            weight, 
            base_experience, 
            types, 
            sprites  
            } = await response.json()
        await Pokemon.create({
            pokemonId,
            name,
            height,
            weight,
            base_experience,
            image: sprites.other['official-artwork'].front_default,
            moves: moves.map(moveData => moveData.move.name),
            types: types.map(typeData => typeData.type.name)
        })
    }
    // seed trainer
    const allPokemon = await Pokemon.find()
    const allPokemonIds = allPokemon.map(pokemon => pokemon._id)

    await Trainer.create({
        username: 'ashketchum',
        email: 'ash@oakpokelab.com',
        password: 'masterball',
        pokemon: allPokemonIds
    })
    console.log('bulbasaur used leech SEED! it was super effective!')
    process.exit(0)
})