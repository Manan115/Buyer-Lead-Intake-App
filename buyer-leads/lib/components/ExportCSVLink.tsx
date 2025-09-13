"use client";

import React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { IconDownload } from "./ui/Icons";

export default function ExportCSVLink({ className }: { className?: string }) {
  const search = useSearchParams();
  const params = new URLSearchParams(search?.toString() || "");
  params.delete("page"); // optional: omit page
  const href = `/api/buyers/export${
    params.toString() ? `?${params.toString()}` : ""
  }`;

  return (
    <Link href={href} className={className ?? "btn btn-secondary"}>
      <IconDownload /> Export CSV
    </Link>
  );
}
