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

  create(createClientDto: CreateClientDto): Promise<Client> {

    const newClient = new Client();
    newClient.name = createClientDto.name;
    newClient.houseNumber = createClientDto.houseNumber;
    newClient.phone = createClientDto.phone;
    newClient.neighborhood = createClientDto.neighborhood;
    newClient.reference = createClientDto.reference;
    newClient.street = createClientDto.street;

    const client = this.clientRepository.create(newClient);
    return this.clientRepository.save(client);
  }

  async remove(id: string): Promise<void> {
    await this.clientRepository.delete(id);
  }

  async update(id: string, client: CreateClientDto): Promise<void> {
    await this.clientRepository.update(id, client);
  }
}
