import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class MotorcycleCourier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;
}
