import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';

import { Pokemon } from './entities/pokemon.entity';

import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';


@Injectable()
export class PokemonService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase()
    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto)
      return pokemon;
    } catch (error) {
      if (error.code === 1100) {
        throw new BadRequestException('Pokemon exist in DB')
      }
      throw new InternalServerErrorException("Can't create Pokemon")
    }

  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(term: string) {

    let pokemon: Pokemon | undefined;

    if (!isNaN(+term)) {
      const responsePok = await this.pokemonModel.findOne({ no: +term })
      if (responsePok) pokemon = responsePok;
    }

    // MongoID
    if (!pokemon && isValidObjectId(term)) {
      const responsePok = await this.pokemonModel.findById(term)
      if (responsePok) pokemon = responsePok;
    }

    // Name
    if (!pokemon) {
      const responsePok = await this.pokemonModel.findOne({ name: term.toLowerCase().trim() })
      if (responsePok) pokemon = responsePok
    }

    if (!pokemon)
      throw new NotFoundException(`Pokemon with id, name or no "${term}" not found`)

    return pokemon;
  }

  update(id: number, updatePokemonDto: UpdatePokemonDto) {
    return `This action updates a #${id} pokemon`;
  }

  remove(id: number) {
    return `This action removes a #${id} pokemon`;
  }
}
