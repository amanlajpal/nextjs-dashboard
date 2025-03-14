import { fetchCustomersPages } from "@/app/lib/data";
import CustomersTable from "@/app/ui/customers/table";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customers",
};

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";
  const currentPage = +(searchParams?.page || 1);
  const totalPages = await fetchCustomersPages(query);
  return <CustomersTable query={query} totalPages={totalPages} currentPage={currentPage}/>;
}
