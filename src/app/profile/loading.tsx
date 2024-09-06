import dynamic from "next/dynamic";

const FullPageLoader = dynamic(() => import("@/components/layout/loader"), {
  ssr: false,
});

export default function Loading() {
  return <FullPageLoader />;
}
