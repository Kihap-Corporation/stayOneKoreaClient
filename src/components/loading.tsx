export default function Loading() {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-[#E91E63]" />
          <p className="text-lg font-medium text-[#E91E63]">Loading</p>
        </div>
      </div>
    )
  }
  