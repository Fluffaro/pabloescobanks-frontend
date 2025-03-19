import AccountList from "./AccountList";
import Header from "@/app/components/Header";
import { User } from "@/app/transaction/page";
const Page = () => {
  return (
    <div className="p-6 bg-white min-h-screen text-black " >
      <AccountList />
    </div>
  );
};

export default Page;
