"use client";
import TableActions from "../TableActions";
import { useMemo, useState } from "react";
import Modal from "../Modal";
import CustomerForm from "./CustomerForm";
import Table from "../Table";
import { Plus, Search, X } from "lucide-react";
import InfoField from "../InfoField";
import { useCrud } from "../../hooks/useCrud";

import type { Customer, CustomerFormData } from "../../types/customer";

const emptyForm: CustomerFormData = {
  name: "",
  email: "",
  phone: "",
  company: "",
  status: "Active",
};

type CustomersClientProps = {
  initialCustomers: Customer[];
};

function getStatusClass(status: string) {
  if (status === "Active") {
    return "bg-success-light text-success";
  }

  return "bg-danger-light text-danger";
}
const customerColumns = [
  { label: "Customer" },
  { label: "Company" },
  { label: "Phone" },
  { label: "Status" },
  { label: "Joined" },
  { label: "Actions", align: "right" as const },
];
export default function CustomersClient({
  initialCustomers,
}: CustomersClientProps) {
  const {
    items: customers,
    loading,
    saving,
    error,
    setError,
    create,
    update,
    remove,
  } = useCrud<Customer>({
    endpoint: "/api/customers",
    initialData: initialCustomers,
    getId: (customer) => customer.id,
  });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [modal, setModal] = useState<"add" | "edit" | "view" | null>(null);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );

  const [form, setForm] = useState<CustomerFormData>(emptyForm);

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const searchValue = search.trim().toLowerCase();

      const matchesSearch =
        customer.name.toLowerCase().includes(searchValue) ||
        customer.email.toLowerCase().includes(searchValue) ||
        customer.company.toLowerCase().includes(searchValue) ||
        customer.phone.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "All" || customer.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [customers, search, statusFilter]);

  function openAddModal() {
    setForm(emptyForm);
    setSelectedCustomer(null);
    setModal("add");
    setError("");
  }

  function openEditModal(customer: Customer) {
    setSelectedCustomer(customer);

    setForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      company: customer.company,
      status: customer.status,
    });

    setModal("edit");
    setError("");
  }

  function openViewModal(customer: Customer) {
    setSelectedCustomer(customer);
    setModal("view");
    setError("");
  }

  function closeModal() {
    if (saving) {
      return;
    }

    setModal(null);
    setSelectedCustomer(null);
    setForm(emptyForm);
  }

  function handleChange(field: keyof CustomerFormData, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) {
      return;
    }

    const isEdit = modal === "edit" && selectedCustomer !== null;

    const success = isEdit
      ? await update(selectedCustomer.id, form)
      : await create(form);

    if (!success) {
      return;
    }

    setModal(null);
    setSelectedCustomer(null);
    setForm(emptyForm);
  }

  async function handleDelete(customer: Customer) {
    const confirmed = window.confirm(`Delete ${customer.name}?`);

    if (!confirmed) {
      return;
    }

    await remove(customer);
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter("All");
  }

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary md:text-3xl">
            Customers
          </h1>

          <p className="mt-1.5 text-sm text-text-secondary md:mt-2">
            Manage your customers and their information.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-dark sm:w-auto"
        >
          <Plus size={18} />
          Add Customer
        </button>
      </div>

      {error && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-danger/20 bg-danger-light px-4 py-3 text-sm text-danger">
          <span>{error}</span>

          <button
            onClick={() => setError("")}
            className="shrink-0 rounded-lg p-1 hover:bg-danger/10"
            aria-label="Close error"
          >
            <X size={17} />
          </button>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-surface shadow-sm">
        <div className="grid gap-3 border-b border-border p-4 md:grid-cols-2 md:p-5">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search customers..."
              className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {loading ? (
          <div className="space-y-3 p-4 md:p-5">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="h-28 animate-pulse rounded-xl bg-background"
              />
            ))}
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary">
              <Search size={21} />
            </div>

            <h2 className="mt-4 font-semibold text-text-primary">
              No customers found
            </h2>

            <p className="mt-1 text-sm text-text-secondary">
              Try changing your search or filter.
            </p>

            {(search || statusFilter !== "All") && (
              <button
                onClick={clearFilters}
                className="mt-4 text-sm font-medium text-primary hover:text-primary-dark"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <Table
              data={filteredCustomers}
              columns={customerColumns}
              getRowKey={(customer) => customer.id}
              renderDesktopCells={(customer) => (
                <>
                  <td className="px-5 py-4">
                    <CustomerName customer={customer} />
                  </td>

                  <td className="px-5 py-4 text-sm text-text-secondary">
                    {customer.company}
                  </td>

                  <td className="px-5 py-4 text-sm text-text-secondary">
                    {customer.phone}
                  </td>

                  <td className="px-5 py-4">
                    <StatusBadge status={customer.status} />
                  </td>

                  <td className="px-5 py-4 text-sm text-text-secondary">
                    {customer.createdAt}
                  </td>

                  <td className="px-5 py-4">
                    <TableActions
                      item={customer}
                      onView={openViewModal}
                      onEdit={openEditModal}
                      onDelete={handleDelete}
                    />
                  </td>
                </>
              )}
              renderMobileContent={(customer) => (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <CustomerName customer={customer} />
                    <StatusBadge status={customer.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <InfoField
                      label="Company"
                      value={customer.company}
                      variant="mobile"
                    />

                    <InfoField
                      label="Phone"
                      value={customer.phone}
                      variant="mobile"
                    />

                    <InfoField
                      label="Joined"
                      value={customer.createdAt}
                      variant="mobile"
                    />

                    <InfoField
                      label="Customer ID"
                      value={`#${customer.id}`}
                      variant="mobile"
                    />
                  </div>

                  <TableActions
                    item={customer}
                    onView={openViewModal}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                    mobile
                  />
                </>
              )}
            />
          </>
        )}

        {!loading && filteredCustomers.length > 0 && (
          <div className="border-t border-border px-4 py-4 text-center text-sm text-text-secondary md:px-5 md:text-left">
            Showing {filteredCustomers.length} of {customers.length} customers
          </div>
        )}
      </div>

      <Modal
        isOpen={modal !== null}
        onClose={closeModal}
        title={
          modal === "add"
            ? "Add Customer"
            : modal === "edit"
              ? "Edit Customer"
              : "Customer Details"
        }
      >
        {modal === "view" && selectedCustomer && (
          <div className="space-y-5 p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-light text-lg font-bold text-primary">
                {selectedCustomer.name.charAt(0)}
              </div>

              <div className="min-w-0">
                <h3 className="truncate font-semibold text-text-primary">
                  {selectedCustomer.name}
                </h3>

                <div className="mt-1">
                  <StatusBadge status={selectedCustomer.status} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <InfoField label="Email" value={selectedCustomer.email} />
              <InfoField label="Phone" value={selectedCustomer.phone} />
              <InfoField label="Company" value={selectedCustomer.company} />
              <InfoField label="Joined" value={selectedCustomer.createdAt} />
            </div>
          </div>
        )}

        {modal !== "view" && (
          <CustomerForm
            form={form}
            saving={saving}
            mode={modal === "edit" ? "edit" : "add"}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onClose={closeModal}
          />
        )}
      </Modal>
    </div>
  );
}

function CustomerName({ customer }: { customer: Customer }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-sm font-semibold text-primary">
        {customer.name.charAt(0)}
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-text-primary">
          {customer.name}
        </p>

        <p className="truncate text-xs text-text-muted">{customer.email}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
        status,
      )}`}
    >
      {status}
    </span>
  );
}
