import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class IceCreamFlavor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  type: number;

  @Column({ default: true })
  availability: boolean;
}
