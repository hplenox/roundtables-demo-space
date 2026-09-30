import { redirect } from "next/navigation";

// The demographics percentage chart and the investment staff committee report
// are now one sheet, served from `staff-report`. Old links land there.
export default async function DemographicsReportRedirect({
  params,
}: {
  params: Promise<{ surveyId: string; orgId: string }>;
}) {
  const { surveyId, orgId } = await params;
  redirect(`/surveys/${surveyId}/organizations/${orgId}/staff-report`);
}
