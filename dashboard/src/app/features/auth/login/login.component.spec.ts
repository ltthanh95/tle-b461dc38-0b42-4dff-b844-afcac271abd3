import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jest.Mocked<AuthService>;
  let router: jest.Mocked<Router>;

  const mockResponse = {
    access_token: 'token',
    user: { id: '1', email: 'test@test.com', name: 'Test', role: {}, organization: {} } as any,
  };

  beforeEach(async () => {
    const authServiceMock = {
      login: jest.fn(),
    } as any;

    const routerMock = {
      navigate: jest.fn(),
    } as any;

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jest.Mocked<AuthService>;
    router = TestBed.inject(Router) as jest.Mocked<Router>;
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onSubmit', () => {
    it('should show error when fields are empty', () => {
      component.email = '';
      component.password = '';
      component.onSubmit();

      expect(component.error).toBe('please fill in all fields');
      expect(authService.login).not.toHaveBeenCalled();
    });

    it('should login successfully and navigate to dashboard', () => {
      component.email = 'test@test.com';
      component.password = 'password123';
      authService.login.mockReturnValue(of(mockResponse));

      component.onSubmit();

      expect(authService.login).toHaveBeenCalledWith('test@test.com', 'password123');
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should show error on login failure', () => {
      component.email = 'test@test.com';
      component.password = 'wrong';
      authService.login.mockReturnValue(throwError(() => new Error('Invalid')));

      component.onSubmit();

      expect(component.error).toBe('invalid credentials');
      expect(component.loading).toBe(false);
    });
  });

  describe('quickLogin', () => {
    it('should set credentials and call onSubmit', () => {
      // mock the login call that happens inside onSubmit
      authService.login.mockReturnValue(of(mockResponse));
      
      component.quickLogin('owner@company.com');

      expect(component.email).toBe('owner@company.com');
      expect(component.password).toBe('password123');
      expect(authService.login).toHaveBeenCalledWith('owner@company.com', 'password123');
    });
  });
});