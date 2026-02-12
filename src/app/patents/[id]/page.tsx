import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPatentData, PATENT_DATA } from '@/lib/patent-data'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateStaticParams() {
  return Object.keys(PATENT_DATA).map((id) => ({ id }))
}

export default async function PatentDetailPage({ params }: PageProps) {
  const { id } = await params
  const patent = getPatentData(id)
  
  if (!patent) {
    notFound()
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'from-[#00A3E1] to-[#00B2A9]'
    if (confidence >= 80) return 'from-[#00B2A9] to-[#4CAF50]'
    if (confidence >= 70) return 'from-[#FFB74D] to-[#FF9800]'
    return 'from-[#EF5350] to-[#E53935]'
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 90) return 'Very Strong'
    if (confidence >= 80) return 'Strong'
    if (confidence >= 70) return 'Moderate'
    return 'Weak'
  }

  return (
    <div className="min-h-screen bg-[#1a1f24] text-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
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
          <Link 
            href="/"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </header>

        {/* Patent Title Section */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-[#00A3E1] text-sm font-medium mb-1">{patent.patent_number}</div>
              <h2 className="text-2xl font-semibold mb-2">{patent.title}</h2>
              <div className="text-sm text-gray-400">
                Assignee: {patent.assignee} • Filed: {patent.filing_date} • Issued: {patent.issue_date}
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold bg-gradient-to-r from-[#00A3E1] to-[#00B2A9] bg-clip-text text-transparent">
                {patent.overall_confidence}%
              </div>
              <div className="text-sm text-gray-400">Invalidity Confidence</div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] border-l-4 border-l-[#00B2A9] rounded-r-2xl p-6 mb-6">
          <div className="text-[#00B2A9] font-semibold mb-2">📋 Analysis Summary</div>
          <p className="text-gray-300">{patent.summary}</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5">
            <div className="text-3xl font-semibold text-[#00A3E1]">{patent.independentClaims}</div>
            <div className="text-sm text-gray-400">Independent Claims</div>
          </div>
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5">
            <div className="text-3xl font-semibold text-[#00A3E1]">{patent.prior_art.length}</div>
            <div className="text-sm text-gray-400">Prior Art References</div>
          </div>
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5">
            <div className="text-3xl font-semibold text-[#00B2A9]">{patent.recommendation}</div>
            <div className="text-sm text-gray-400">Recommendation</div>
          </div>
        </div>

        {/* Prior Art References */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Prior Art References</h3>
          <div className="grid gap-3">
            {patent.prior_art.map((ref, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl">
                <div>
                  <div className="font-semibold">{ref.name}</div>
                  <div className="text-sm text-gray-400">{ref.citation}</div>
                  <div className="text-xs text-gray-500 mt-1">{ref.relevance}</div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold bg-gradient-to-r ${getConfidenceColor(ref.confidence)} bg-clip-text text-transparent`}>
                    {ref.confidence}%
                  </div>
                  <div className="text-xs text-gray-500">{getConfidenceLabel(ref.confidence)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Claim 1 Analysis */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-2">{patent.claim1Label} — Element-by-Element Analysis</h3>
          <p className="text-sm text-gray-400 mb-4">{patent.claim1Description}</p>
          
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-[#00A3E1]/10">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#00A3E1] uppercase">Element</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#00A3E1] uppercase">Limitation</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#00A3E1] uppercase">Prior Art Coverage</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#00A3E1] uppercase">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {patent.claim1Elements.map((element, index) => (
                  <tr key={index} className="border-t border-white/[0.08]">
                    <td className="px-4 py-3 font-mono text-sm text-[#00A3E1]">{element.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{element.text}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">{element.prior_art_coverage}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-[#2d343c] rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full bg-gradient-to-r ${getConfidenceColor(element.confidence)}`}
                            style={{ width: `${element.confidence}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">{element.confidence}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Claim 2 Analysis */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-2">{patent.claim2Label} — Element-by-Element Analysis</h3>
          <p className="text-sm text-gray-400 mb-4">{patent.claim2Description}</p>
          
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-[#00A3E1]/10">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#00A3E1] uppercase">Element</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#00A3E1] uppercase">Limitation</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#00A3E1] uppercase">Prior Art Coverage</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#00A3E1] uppercase">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {patent.claim2Elements.map((element, index) => (
                  <tr key={index} className="border-t border-white/[0.08]">
                    <td className="px-4 py-3 font-mono text-sm text-[#00A3E1]">{element.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{element.text}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">{element.prior_art_coverage}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-[#2d343c] rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full bg-gradient-to-r ${getConfidenceColor(element.confidence)}`}
                            style={{ width: `${element.confidence}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">{element.confidence}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Claim 3 Analysis (if exists) */}
        {patent.claim3Elements && patent.claim3Elements.length > 0 && (
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-semibold mb-2">{patent.claim3Label} — Element-by-Element Analysis</h3>
            <p className="text-sm text-gray-400 mb-4">{patent.claim3Description}</p>
            
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="bg-[#00A3E1]/10">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#00A3E1] uppercase">Element</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#00A3E1] uppercase">Limitation</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#00A3E1] uppercase">Prior Art Coverage</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#00A3E1] uppercase">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {patent.claim3Elements.map((element, index) => (
                    <tr key={index} className="border-t border-white/[0.08]">
                      <td className="px-4 py-3 font-mono text-sm text-[#00A3E1]">{element.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{element.text}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">{element.prior_art_coverage}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-[#2d343c] rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full bg-gradient-to-r ${getConfidenceColor(element.confidence)}`}
                              style={{ width: `${element.confidence}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400">{element.confidence}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 pt-6 border-t border-white/[0.08] flex justify-between text-xs text-gray-500">
          <div>NPI Patent Tracker • Sonance Legal</div>
          <div>Analysis Date: {new Date().toLocaleDateString()}</div>
        </footer>
      </div>
    </div>
  )
}
