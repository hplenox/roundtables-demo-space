import { ClipboardList } from "lucide-react";

export default function MySurveysPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <ClipboardList size={20} className="text-slate-400" />
      </div>
      <h2 className="text-slate-700 font-semibold text-base mb-1">My Surveys</h2>
      <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
        Your assigned surveys will appear here once your LP sends you an invitation.
      </p>
    </div>
  );
}
