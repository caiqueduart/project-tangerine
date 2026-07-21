import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HouseModule } from './house/house.module';
import {TypeOrmModule} from "@nestjs/typeorm";

@Module({
  imports: [HouseModule, TypeOrmModule.forRoot({
    type: 'sqlite',
    database: 'db.sqlite',
    autoLoadEntities: true,
    synchronize: true,
  })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
