import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { CommonModule } from '../common/common.module';

@Module({
    imports: [CommonModule, TypeOrmModule.forFeature([User])],
    exports: [UserService],
    providers: [UserService],
    controllers: [UserController],
})
export class UserModule {}
