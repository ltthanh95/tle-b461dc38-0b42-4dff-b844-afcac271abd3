export interface User {
    id: string;
    email: string;
    name: string;
    role: {
      id: string;
      name: string;
    };
    organization: {
      id: string;
      name: string;
    };
  }
  
  export interface LoginResponse {
    access_token: string;
    user: User;
  }