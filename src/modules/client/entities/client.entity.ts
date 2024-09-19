import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  phone: string;

  @Column()
  name: string;

  @Column()
  street: string;

  @Column()
  neighborhood: string;

  @Column()
  houseNumber: number;

  @Column({ nullable: true })
  reference: string;
}