export interface User {
  userId?: string;
  userName?: string;
  loginId?: string;
  employeeId?: string;
}

export interface UserRole {
   roleId?:string;
   roleCode?:string;
   roleName?:string;
   roleLevel?:number;
   flid?:string;
   originalId?:string;
   fnlnDisplayCode?:string;
   fnlnDescription?:string;
   parentFlids?:string;
   allParents?:string;
   parents?:string;
   elementType?:string;
}