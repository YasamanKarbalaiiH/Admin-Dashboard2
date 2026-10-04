export type CustomerStatus = "Active" | "Inactive";

export type Customer = {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: CustomerStatus;
  createdAt: string;
};

export type CustomerFormData = {
  name: string;
  email: string;
  phone: string;
  company: string;
  status: CustomerStatus;
};
