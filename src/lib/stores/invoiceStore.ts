import { Invoice } from '@/types';

const globalForInvoices = globalThis as unknown as {
  inMemoryInvoicesStore?: Map<string, Invoice>;
};

export const inMemoryInvoicesStore =
  globalForInvoices.inMemoryInvoicesStore || new Map<string, Invoice>();

if (process.env.NODE_ENV !== 'production') {
  globalForInvoices.inMemoryInvoicesStore = inMemoryInvoicesStore;
}
