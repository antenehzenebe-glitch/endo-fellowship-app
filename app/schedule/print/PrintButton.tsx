'use client'

// app/schedule/print/PrintButton.tsx
// Tiny client island: triggers the browser print dialog (which offers
// "Save as PDF"). Hidden on the printed page via the .no-print class.
export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="no-print inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white"
      style={{ background: '#c8102e' }}
    >
      🖨 Print / Save as PDF
    </button>
  )
}
