'use client'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="text-sm font-semibold px-4 py-1.5 rounded bg-crimson text-white"
    >
      🖨 Print / Save PDF
    </button>
  )
}
