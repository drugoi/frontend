import { UserRole } from "./enums";

export interface ApplicationUser {
  id: number;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  fullname: string;
  roles: Array<UserRole>;
  salariesCount: number;
  emailConfirmed: boolean;
  identityId: number | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
