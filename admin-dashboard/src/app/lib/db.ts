import { promises as fs } from "fs";
import path from "path";

import { Customer } from "../types/customer";
import { Product } from "../types/product";
import { Invoice } from "../types/invoice";

type Dashboard = {
  statistics: {
    customers: number;
    products: number;
    invoices: number;
    revenue: number;
  };

  revenue: {
    month: string;
    value: number;
  }[];
};

type Profile = {
  id: number;
  name: string;
  role: string;
  email: string;
  phone: string;
  location: string;
  joined: string;
};
type Settings = {
  emailNotifications: boolean;
  pushNotifications: boolean;
  darkMode: boolean;
};

export type Database = {
  customers: Customer[];
  products: Product[];
  invoices: Invoice[];
  dashboard: Dashboard;
  profile: Profile;
  settings: Settings;
};

const dbPath = path.join(process.cwd(), "src", "app", "data", "db.json");

export async function readDb(): Promise<Database> {
  const file = await fs.readFile(dbPath, "utf-8");

  return JSON.parse(file) as Database;
}

export async function writeDb(data: Database): Promise<void> {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2), "utf-8");
}
