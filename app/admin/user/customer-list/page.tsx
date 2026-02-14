import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const customers = [
  {
    id: 1,
    email: "rahul.sharma@example.com",
    name: "Rahul Sharma",
    status: "not_block",
  },
  {
    id: 2,
    email: "priya.patel@example.com",
    name: "Priya Patel",
    status: "block",
  },
  {
    id: 3,
    email: "arjun.mehta@example.com",
    name: "Arjun Mehta",
    status: "not_block",
  },
];

const Page = () => {
  return (
    <section className="min-h-screen w-full bg-[linear-gradient(180deg,#f8fbff_0%,#eef3fb_100%)] p-4 md:p-7">
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <div className="rounded-2xl border border-[#1b263b]/10 bg-white p-5 shadow-sm md:p-6">
          <h1 className="text-2xl font-semibold text-[#1b263b] md:text-3xl">
            Customer List
          </h1>
        </div>

        <div className="rounded-2xl border border-[#1b263b]/10 bg-white p-3 shadow-sm md:p-4">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#1b263b]/5 hover:bg-[#1b263b]/5">
                <TableHead className="font-semibold text-[#1b263b]">Email</TableHead>
                <TableHead className="font-semibold text-[#1b263b]">Name</TableHead>
                <TableHead className="font-semibold text-[#1b263b]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell className="font-medium text-[#1b263b]">
                    {customer.name}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        customer.status === "block"
                          ? "bg-red-100 text-red-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {customer.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
};

export default Page;
