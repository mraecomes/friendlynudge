export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#1E3A5F]">FriendlyNudge</h1>
          <p className="text-sm text-[#6B7280] mt-1">Dependency-aware Gantt timelines</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-lg shadow-sm p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
