import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RoleEnum } from './users.controller';
import * as bcrypt from 'bcryptjs'; 

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
      const classRecord = await this.prisma.class.findFirst({
        where: {
          majorId: createUserDto.majorId,
          gradeId: createUserDto.gradeId,
        },
      });
      
      const majorId = typeof createUserDto.majorId === 'string' 
        ? parseInt(createUserDto.majorId, 10) 
        : createUserDto.majorId;
      
      const gradeId = typeof createUserDto.gradeId === 'string' 
        ? parseInt(createUserDto.gradeId, 10) 
        : createUserDto.gradeId;
      
      const roleId = typeof createUserDto.roleId === 'string' 
        ? parseInt(createUserDto.roleId, 10) 
        : createUserDto.roleId;
      
      const classId = classRecord ? classRecord.id : null;
      
      const query = `
        INSERT INTO \`User\` 
        (\`fullName\`, \`nationalCode\`, \`phoneNumber\`, \`password\`, \`roleId\`, \`majorId\`, \`gradeId\`, \`classId\`) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const values = [
        createUserDto.fullName,
        createUserDto.nationalCode,
        createUserDto.phoneNumber,
        hashedPassword,
        roleId,
        majorId,
        gradeId,
        classId
      ];
      
      console.log('Executing raw SQL query with values:', values);
      
      await this.prisma.$executeRawUnsafe(query, ...values);
      
      return this.findByNationalCode(createUserDto.nationalCode);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
  


  async findAll() {
    return this.prisma.user.findMany({
      include: { role: true },
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByNationalCode(nationalCode: string) {
    const user = await this.prisma.user.findUnique({
      where: { nationalCode },
      include: { role: true },
    });
    
    if (!user) {
      try {
        const result = await this.prisma.$queryRaw`
          SELECT * FROM \`User\` WHERE nationalCode = ${nationalCode} LIMIT 1
        `;
        
        if (Array.isArray(result) && result.length > 0) {
          return result[0];
        }
        
        throw new NotFoundException('User not found');
      } catch (error) {
        console.error('Error finding user by national code:', error);
        throw error;
      }
    }
    
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const userExists = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!userExists) throw new NotFoundException('User not found');

    const hashedPassword = updateUserDto.password ? await bcrypt.hash(updateUserDto.password, 10) : userExists.password;

    return await this.prisma.user.update({
      where: { id },
      data: {
        fullName: updateUserDto.fullName,
        nationalCode: updateUserDto.nationalCode,
        phoneNumber: updateUserDto.phoneNumber,
        password: hashedPassword, 
        roleId: updateUserDto.roleId,
      },
    });
  }

  async remove(id: number) {
    const userExists = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!userExists) throw new NotFoundException('User not found');

    return await this.prisma.user.delete({
      where: { id },
    });
  }

  async updateRole(id: number, roleId: number) {
    const userExists = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!userExists) throw new NotFoundException('User not found');

    return await this.prisma.user.update({
      where: { id },
      data: { roleId },
    });
  }

  async getRoleIdByName(roleName: RoleEnum): Promise<number> {
    const role = await this.prisma.role.findUnique({
      where: { name: roleName },
    });
    if (!role) throw new NotFoundException('Role not found'); 
    return role.id;
  }
}

