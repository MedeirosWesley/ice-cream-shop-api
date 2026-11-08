import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { cleanDisplay, distinctByKey, resolveCanonical } from './utils/address-normalize';

type AddressField = 'street' | 'neighborhood';

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

  /** Bairros distintos, deduplicados pela chave normalizada. */
  async findNeighborhoods(): Promise<string[]> {
    return distinctByKey(await this.distinctValues('neighborhood'));
  }

  /** Ruas distintas, deduplicadas pela chave normalizada. */
  async findStreets(): Promise<string[]> {
    return distinctByKey(await this.distinctValues('street'));
  }

  async create(createClientDto: CreateClientDto): Promise<Client> {
    const { street, neighborhood } = await this.canonicalAddress(createClientDto);

    const newClient = new Client();
    // O app gera o id de clientes criados offline; reenviar não pode duplicar.
    if (createClientDto.id) {
      newClient.id = createClientDto.id;
    }
    newClient.name = cleanDisplay(createClientDto.name);
    newClient.houseNumber = createClientDto.houseNumber;
    newClient.phone = createClientDto.phone;
    newClient.neighborhood = neighborhood;
    newClient.reference = createClientDto.reference;
    newClient.street = street;

    const client = this.clientRepository.create(newClient);
    return this.clientRepository.save(client);
  }

  async remove(id: string): Promise<void> {
    await this.clientRepository.delete(id);
  }

  async update(id: string, client: CreateClientDto): Promise<void> {
    const data: Partial<Client> = {};
    if (client.phone !== undefined) data.phone = client.phone;
    if (client.name !== undefined) data.name = cleanDisplay(client.name);
    if (client.houseNumber !== undefined) data.houseNumber = client.houseNumber;
    if (client.reference !== undefined) data.reference = client.reference;

    const { street, neighborhood } = await this.canonicalAddress(client);
    if (client.street !== undefined && client.street !== null) data.street = street;
    if (client.neighborhood !== undefined && client.neighborhood !== null) data.neighborhood = neighborhood;

    if (Object.keys(data).length === 0) return;
    await this.clientRepository.update(id, data);
  }

  /**
   * Limpa rua/bairro e reaproveita a grafia já existente no banco com a mesma
   * chave normalizada (sem acento, sem caixa, sem espaços extras). Sem
   * correspondência, salva em Title Case.
   */
  private async canonicalAddress(dto: Partial<CreateClientDto>): Promise<{ street: string; neighborhood: string }> {
    const street = dto?.street != null
      ? resolveCanonical(dto.street, await this.distinctValues('street'))
      : dto?.street;
    const neighborhood = dto?.neighborhood != null
      ? resolveCanonical(dto.neighborhood, await this.distinctValues('neighborhood'))
      : dto?.neighborhood;
    return { street, neighborhood };
  }

  private async distinctValues(field: AddressField): Promise<string[]> {
    const rows: Record<string, string>[] = await this.clientRepository
      .createQueryBuilder('client')
      .select(`DISTINCT client.${field}`, 'value')
      .getRawMany();
    return rows.map((row) => row.value).filter((value) => value != null);
  }
}
