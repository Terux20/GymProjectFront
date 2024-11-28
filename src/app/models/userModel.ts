export class UserModel {
    nameidentifier: string;
    email: string;
    name: string;
    role: string;
    nbf: number;
    exp: number;
    iss: string;
    aud: string;
  
    constructor(data: any = {}) {
      this.nameidentifier = data['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || '';
      this.email = data['1'] || '';
      this.name = data['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || '';
      this.role = data['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || '';
      this.nbf = data.nbf || 0;
      this.exp = data.exp || 0;
      this.iss = data.iss || '';
      this.aud = data.aud || '';
    }
  }