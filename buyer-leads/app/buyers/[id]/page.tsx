import BuyerEditForm from "@/lib/components/BuyerEditForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function BuyerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { id } = params;
  return <BuyerEditForm id={id} />;
}