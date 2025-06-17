import { AuthResponse, SignUpDto, LoginDto } from '@/types/api';
import { BaseApiClient } from './api';

export class AuthService extends BaseApiClient {
  async signup(data: SignUpDto): Promise<AuthResponse> {
    return this.post('/auth/signup', data, false);
  }

  async login(data: LoginDto): Promise<AuthResponse> {
    return this.post('/auth/login', data, false);
  }
}

export const authService = new AuthService();
