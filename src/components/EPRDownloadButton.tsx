'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'

interface EPRDownloadButtonProps {
  patentId: string
  patentNumber: string
}

export default function EPRDownloadButton({ patentId, patentNumber }: EPRDownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDownloadPDF = async () => {
    setIsLoading(true)
    try {
      // Dynamic import of html2pdf to avoid SSR issues
      const html2pdf = (await import('html2pdf.js')).default

      const element = document.querySelector('[data-epr-document]') as HTMLElement
      if (!element) {
        console.error('EPR document not found')
        return
      }

      // Format date for filename
      const now = new Date()
      const monthStr = now.toLocaleDateString('en-US', { month: 'short' })
      const dayStr = String(now.getDate()).padStart(2, '0')
      const yearStr = now.getFullYear()
      const dateStr = `${monthStr}_${dayStr}_${yearStr}`

      // Create filename
      const filename = `EPR_${patentId}_${dateStr}.pdf`

      // HTML2PDF options
      const options: any = {
        margin: 10,
        filename: filename,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'letter' },
      }

      // Generate PDF
      html2pdf().set(options).from(element).save()

      // Show success message
      setTimeout(() => {
        console.log(`Downloaded ${filename}`)
      }, 1000)
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Error downloading PDF. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleDownloadPDF}
      disabled={isLoading}
      className="inline-flex items-center gap-2 px-4 py-2 bg-[#00B2A9] hover:bg-[#009994] disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded-lg text-sm font-medium text-white"
      title="Download EPR as PDF"
    >
      <Download className="w-4 h-4" />
      {isLoading ? 'Generating...' : 'Download PDF'}
    </button>
  )
}
