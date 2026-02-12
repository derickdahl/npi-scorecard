import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPatentData, PATENT_DATA } from '@/lib/patent-data'
import EPRDocument from '@/components/EPRDocument'
import EPRDownloadButton from '@/components/EPRDownloadButton'

interface PageProps {
  params: Promise<{ id: string }>
}

export const dynamicParams = true

export async function generateStaticParams() {
  // Generate EPR pages for all 18 patents
  const ids = ['140', '141', '142', '275', '279', '444', '458', '535', '550', '387', '639', '026', '330', '658', '399', '515', '334', '884']
  return ids.map(id => ({ id }))
}

export default async function EPRDraftPage({ params }: PageProps) {
  const { id } = await params
  const patent = getPatentData(id)
  
  if (!patent) {
    notFound()
  }

  return (
    <>
      <div className="min-h-screen bg-[#1a1f24] text-white">
        <div className="max-w-4xl mx-auto px-6 py-10">
          {/* Header with Download Button */}
          <header className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 bg-gradient-to-br from-[#00A3E1] to-[#00B2A9] rounded-lg flex items-center justify-center font-bold">
                  S
                </div>
                <h1 className="text-2xl font-light tracking-tight">
                  NPI Patent <span className="text-[#00A3E1]">Tracker</span>
                </h1>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <EPRDownloadButton patentId={patent.short_name} patentNumber={patent.patent_number} />
              <Link 
                href={`/patents/${id}`}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                ← Analysis
              </Link>
            </div>
          </header>

          <EPRDocument patent={patent} />

          {/* Footer */}
          <footer className="text-center text-sm text-gray-500 mt-8 pt-6 border-t border-white/[0.08]">
            <p>DRAFT — For Review Purposes Only</p>
            <p className="mt-2">NPI Patent Tracker • Sonance Legal</p>
          </footer>
        </div>
      </div>
    </>
  )
}
