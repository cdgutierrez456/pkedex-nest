import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';

import { Pokemon } from './entities/pokemon.entity';

import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { PaginationDto } from '../common/dto/pagination.dto';


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
      this.handleExceptions(error)
    }

  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 1, offset = 0 } = paginationDto

    return await this.pokemonModel.find()
      .limit(limit)
      .skip(offset)
      .sort({
        no: 1
      })
      .select('-__v')
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

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term)
    if (updatePokemonDto.name)
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase()

    try {
      await pokemon.updateOne(updatePokemonDto, { new: true })
      return { ...pokemon.toJSON(), ...updatePokemonDto };
    } catch (error) {
      this.handleExceptions(error)
    }
  }

  async remove(id: string) {
    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id })

    if (!deletedCount)
      throw new NotFoundException(`Pokemon with id ${id} not found`)

    return;
  }

  async removeAll() {
    await this.pokemonModel.deleteMany({})
  }

  async createMany(pokemons: CreatePokemonDto[]) {
    await this.pokemonModel.insertMany(pokemons)
  }

  private handleExceptions(error: any) {
    if (error.code === 1100) {
      throw new BadRequestException('Pokemon existed')
    }
    throw new InternalServerErrorException("Can't resolve Database Query")
  }

}
