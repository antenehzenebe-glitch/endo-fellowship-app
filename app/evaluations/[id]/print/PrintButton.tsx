'use client'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="text-sm font-semibold px-4 py-1.5 rounded text-white"
      style={{ background: '#c8102e' }}
    >
      🖨 Print / Save PDF
    </button>
  )
}
