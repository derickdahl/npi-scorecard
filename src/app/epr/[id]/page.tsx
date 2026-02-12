import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPatentData, PATENT_DATA } from '@/lib/patent-data'
import EPRDocument from '@/components/EPRDocument'
import EPRDownloadButton from '@/components/EPRDownloadButton'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateStaticParams() {
  // Generate EPR pages for all 18 patents
  return [
    { id: '140' },
    { id: '141' },
    { id: '142' },
    { id: '275' },
    { id: '279' },
    { id: '444' },
    { id: '458' },
    { id: '535' },
    { id: '550' },
    { id: '387' },
    { id: '639' },
    { id: '026' },
    { id: '330' },
    { id: '658' },
    { id: '399' },
    { id: '515' },
    { id: '334' },
    { id: '884' },
  ]
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
              <EPRDownloadButton patentId={id} patentNumber={patent.patent_number} />
              <Link 
                href={`/patents/${id}`}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                ← Back
              </Link>
            </div>
          </header>

        </div>
      </div>
      <EPRDocument patent={patent} />
    </>
  )
}
