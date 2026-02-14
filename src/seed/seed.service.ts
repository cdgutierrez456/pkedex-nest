import { Injectable } from '@nestjs/common';

import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

import { PokeResponse } from './interfaces/poke-response.interface';
import { PokemonService } from 'src/pokemon/pokemon.service';

@Injectable()
export class SeedService {

  constructor(
    private readonly pokemonService: PokemonService,
    private readonly http: AxiosAdapter
  ) {}



  async executeSeed() {
    await this.pokemonService.removeAll()
    const data = await this.http.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=700')

    const pokemonToInsert: { no: number, name: string }[] = [];

    data.results.forEach(({ name, url }) => {
      const segments = url.split('/')
      const no: number = +segments[segments.length - 2]
      pokemonToInsert.push({ no, name })
    })

    await this.pokemonService.createMany(pokemonToInsert)

    return 'Seed executed';
  }

}
