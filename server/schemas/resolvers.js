const { GraphQLError } = require('graphql')
const {Pokemon, Trainer} = require('../models')
const { signToken } = require('../utils/auth')

const resolvers = {
    Query: {
        pokemons: async (parent, args, context, info) => {
            return await Pokemon.find()
        },
        pokemon: async (parent, args, context, info) => {
            return await Pokemon.findOne({ pokemonId: args.pokemonId })
        },
        trainers: async (parent, args, context, info) => {
            return await Trainer.find()
        },
        trainer: async (parent, args, context, info) => {
            return await Trainer.findById(args._id)
        }
    },
    Mutation: {
        login: async (parent, {email, password}, context, info) => {
            // find trainer by email
            const trainer = await Trainer.findOne({ email })
            if (!trainer) {
                throw new GraphQLError('Trainer not found', {
                    extensions: {
                        code: 'USER NOT FOUND',
                        http: { status: 404}
                    }
                })
            }
            // verify pw
            const isCorrectPassword = await trainer.isCorrectPassword(password)
            if (!isCorrectPassword) {
                throw new GraphQLError('Password is incorrect', {
                    extensions: {
                        code: 'INCORRECT PASSWORD',
                        http: { status: 401}
                    }
                })
            }
            // sign token
            const token = signToken(trainer)
            // return Auth obj
            return { token, trainer }
        },

        addPokemon: async (parent, args, context, info) => {
            const pokemon = await Pokemon.create(args)
            if (args.trainerID) {
                await Trainer.findByIdAndUpdate(args.trainerId, {
                    $addToSet: {
                        pokemon: pokemon._id
                    }
                })
            }
            return pokemon
        },
        addTrainer: async (parent, args, context, info) => {
            const trainer = await Trainer.create(args)
            return trainer.populate('pokemon')
        }
    }
}

module.exports = resolvers