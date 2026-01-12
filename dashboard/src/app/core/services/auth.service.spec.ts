import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const mockLoginResponse = {
    access_token: 'test-token',
    user: {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: { id: 'role1', name: 'Admin' },
      organization: { id: 'org1', name: 'Test Org' },
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should login and store token', (done) => {
      service.login('test@example.com', 'password123').subscribe((response) => {
        expect(response).toEqual(mockLoginResponse);
        expect(localStorage.getItem('token')).toBe('test-token');
        expect(localStorage.getItem('user')).toBeTruthy();
        done();
      });

      const req = httpMock.expectOne('http://localhost:3000/api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        email: 'test@example.com',
        password: 'password123',
      });
      req.flush(mockLoginResponse);
    });
  });

  describe('logout', () => {
    it('should clear token and user', () => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify(mockLoginResponse.user));

      service.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
      expect(service.getCurrentUser()).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      localStorage.setItem('token', 'test-token');
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return false when token does not exist', () => {
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      localStorage.setItem('token', 'test-token');
      expect(service.getToken()).toBe('test-token');
    });
  });
});