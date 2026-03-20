import { Suspense } from "react";
import { MobilePreview } from "./MobilePreview";

function MobileFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-gradient-to-b from-clarity-periwinkle to-clarity-mist text-sm text-clarity-slate">
      Loading preview…
    </div>
  );
}

export default function MobilePreviewPage() {
  return (
    <Suspense fallback={<MobileFallback />}>
      <MobilePreview />
    </Suspense>
  );
}
