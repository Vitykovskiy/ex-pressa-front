export enum AuthStatus {
  Idle = "idle",
  Checking = "checking",
  Authorized = "authorized",
  Unauthorized = "unauthorized",
}

export enum RoleCode {
  User = "USER",
  Barista = "BARISTA",
  Admin = "ADMIN",
}

export type Role = {
  id: number;
  code: RoleCode;
  name: string;
};

export type User = {
  id: number;
  name: string;
  tgId?: string | null;
  tgUsername?: string | null;
  isActive: boolean;
  isConfirmed: boolean;
  confirmationRequestedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  roles: Role[];
  fullName?: string | null;
  fio?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  middleName?: string | null;
};
