import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
  ) { }

  findAll(): Promise<Client[]> {
    return this.clientRepository.find();
  }

  findOne(id: string): Promise<Client> {
    return this.clientRepository.findOneBy({ id });
  }

  create(client: CreateClientDto): Promise<Client> {
    return this.clientRepository.save(client);
  }

  async remove(id: string): Promise<void> {
    await this.clientRepository.delete(id);
  }
}
