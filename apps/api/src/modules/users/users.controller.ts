import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: "Get the current user's profile" })
  @ApiResponse({ status: 200, description: 'Profile retrieved' })
  async me(@CurrentUser() userId: string) {
    const data = await this.usersService.getProfile(userId);
    return { success: true, data };
  }

  @Patch('me')
  @ApiOperation({ summary: "Update the current user's profile" })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  async updateMe(@CurrentUser() userId: string, @Body() dto: UpdateUserDto) {
    const data = await this.usersService.updateProfile(userId, dto);
    return { success: true, data };
  }

  @Patch('me/password')
  @UseGuards(ThrottlerGuard)
  @ApiOperation({ summary: "Change the current user's password" })
  @ApiResponse({ status: 200, description: 'Password changed' })
  async changePassword(
    @CurrentUser() userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    await this.usersService.changePassword(userId, dto);
    return { success: true };
  }
}
