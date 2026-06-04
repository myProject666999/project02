import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarModule } from './modules/car/car.module';
import { ProcessModule } from './modules/process/process.module';
import { SubTaskModule } from './modules/sub-task/sub-task.module';
import { PartModule } from './modules/part/part.module';
import { RepairLogModule } from './modules/repair-log/repair-log.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '127.0.0.1',
      port: 3306,
      username: 'root',
      password: '123456',
      database: 'retro_car_repair',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
      logging: true,
    }),
    CarModule,
    ProcessModule,
    SubTaskModule,
    PartModule,
    RepairLogModule,
  ],
})
export class AppModule {}
