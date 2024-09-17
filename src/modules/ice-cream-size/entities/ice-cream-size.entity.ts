import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class IceCreamSize {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  size: number;

  @Column()
  type: number;

  @Column('decimal')
  price: number;
}
