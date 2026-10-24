"use client";
// Approval route. Buyer owner → S4 sheet, buyer staff → S4s (locked above RM500),
// supplier owner → P3 inbox, supplier rep → staff view locked above RM300. Switches live with the role.

import * as api from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { useDemo } from "@/lib/demo-context";
import { Screen } from "@/components/Screen";
import { ApprovalSheet } from "@/components/ApprovalSheet";
import { StaffApproval } from "@/components/StaffApproval";
import { ApprovalInbox } from "@/components/ApprovalInbox";

export default function ApprovePage({ params }: { params: { id: string } }) {
  const { side, role } = useDemo();
  const deal = useApi(() => api.getDeal(params.id), [params.id]);
  if (!deal) return <Screen>{null}</Screen>;
  if (role === "staff") return <StaffApproval deal={deal} side={side} />;
  return side === "buyer" ? <ApprovalSheet deal={deal} /> : <ApprovalInbox deal={deal} />;
}
