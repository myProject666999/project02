import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Car } from '../../car/entities/car.entity';

@Entity('repair_logs')
export class RepairLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  car_id: number;

  @Column({ type: 'date' })
  log_date: Date;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'json', nullable: true })
  photos: string[];

  @ManyToOne(() => Car, (car) => car.repairLogs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'car_id' })
  car: Car;
}
