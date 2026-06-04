import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { RestorationRoute } from '../../../common/enums';
import { Process } from '../../process/entities/process.entity';
import { Part } from '../../part/entities/part.entity';
import { RepairLog } from '../../repair-log/entities/repair-log.entity';

@Entity('cars')
export class Car {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 17, unique: true })
  vin: string;

  @Column({ type: 'varchar', length: 50 })
  brand: string;

  @Column({ type: 'varchar', length: 50 })
  model: string;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({
    type: 'enum',
    enum: RestorationRoute,
    default: RestorationRoute.RESTORATION,
  })
  restoration_route: RestorationRoute;

  @Column({ type: 'json', nullable: true })
  original_photos: string[];

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @OneToMany(() => Process, (process) => process.car)
  processes: Process[];

  @OneToMany(() => Part, (part) => part.car)
  parts: Part[];

  @OneToMany(() => RepairLog, (repairLog) => repairLog.car)
  repairLogs: RepairLog[];
}
