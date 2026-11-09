import OnlineRoom from "@/components/online/OnlineRoom";

export default async function OnlineRoomPage({
  params,
}: PageProps<"/play/online/[code]">) {
  const { code } = await params;
  return <OnlineRoom code={code} />;
}
