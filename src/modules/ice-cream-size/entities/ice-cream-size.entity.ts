import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class IceCreamSize {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  size: number;

  @Column()
  type: number;

  @Column('decimal')
  price: number;
}
