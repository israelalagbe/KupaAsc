import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(@Body(ValidationPipe) signUpDto: SignUpDto): Promise<AuthResponseDto> {
    return await this.authService.signUp(signUpDto);
  }

  @Post('login')
  async login(@Body(ValidationPipe) loginDto: LoginDto): Promise<AuthResponseDto> {
    return await this.authService.login(loginDto);
  }
}
