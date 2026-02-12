'use client'

import { PatentAnalysis } from '@/lib/patent-data'

interface EPRDocumentProps {
  patent: PatentAnalysis
}

export default function EPRDocument({ patent }: EPRDocumentProps) {
  const formattedDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  return (
    <div className="min-h-screen bg-[#1a1f24] text-white" data-epr-document>
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#00A3E1] to-[#00B2A9] rounded-lg flex items-center justify-center font-bold">
              S
            </div>
            <h1 className="text-2xl font-light tracking-tight">
              NPI Patent <span className="text-[#00A3E1]">Tracker</span>
            </h1>
          </div>
        </header>

        {/* Document Header */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-semibold rounded-full">
              DRAFT
            </span>
            <span className="px-3 py-1 bg-[#00A3E1]/20 text-[#00A3E1] text-xs font-semibold rounded-full">
              EPR REQUEST
            </span>
          </div>
          <h1 className="text-2xl font-bold mb-2">REQUEST FOR EX PARTE REEXAMINATION</h1>
          <h2 className="text-xl text-gray-300 mb-4">{patent.patent_number}</h2>
          <div className="text-sm text-gray-400">
            <p>Title: {patent.title}</p>
            <p>Attorney Docket No.: [TO BE ASSIGNED]</p>
            <p>Prepared: {formattedDate}</p>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-[#00A3E1]">TABLE OF CONTENTS</h3>
          <div className="space-y-2 text-sm">
            <p>I. Introduction</p>
            <p>II. Statement of Substantial New Question of Patentability</p>
            <p>III. Background of the &apos;{patent.short_name} Patent</p>
            <p>IV. Summary of Prior Art</p>
            <p>V. Claim Construction</p>
            <p>VI. Detailed Claim Analysis</p>
            <p>VII. Conclusion</p>
            <p>Exhibit A: Claim Charts</p>
          </div>
        </div>

        {/* Section I */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-[#00A3E1]">I. INTRODUCTION</h3>
          <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-4">
            <p>
              Pursuant to 35 U.S.C. §§ 302-307 and 37 C.F.R. § 1.510, Requester respectfully requests 
              ex parte reexamination of all claims of {patent.patent_number} (&quot;the &apos;{patent.short_name} patent&quot;), 
              entitled &quot;{patent.title},&quot; issued on {new Date(patent.issue_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} to 
              {' '}{patent.assignee}.
            </p>
            <p>
              This request is based on substantial new questions of patentability raised by prior art 
              patents and printed publications that were not considered during the original prosecution 
              of the &apos;{patent.short_name} patent. As detailed below, this prior art anticipates and/or renders obvious 
              all challenged claims.
            </p>
            <p>
              The applicable filing fee pursuant to 37 C.F.R. § 1.20(c)(1) is submitted herewith.
            </p>
          </div>
        </div>

        {/* Section II */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-[#00A3E1]">II. STATEMENT OF SUBSTANTIAL NEW QUESTION OF PATENTABILITY</h3>
          <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-4">
            <p>
              The following prior art references raise substantial new questions of patentability 
              as to all independent claims of the &apos;{patent.short_name} patent:
            </p>
            
            <div className="bg-white/[0.02] rounded-xl p-4 space-y-3">
              {patent.prior_art.slice(0, 6).map((ref, index) => (
                <div key={index} className="border-l-2 border-[#00A3E1] pl-4">
                  <p className="font-semibold text-white">
                    {ref.patent_number ? `${ref.name} (${ref.patent_number})` : ref.name}
                  </p>
                  <p className="text-sm mt-1">{ref.relevance}</p>
                </div>
              ))}
              {patent.prior_art.length > 6 && (
                <p className="text-sm text-gray-400 italic">
                  ... and {patent.prior_art.length - 6} additional references (see Section IV)
                </p>
              )}
            </div>

            <p>
              These references were not cited or considered during prosecution of the &apos;{patent.short_name} patent. 
              As demonstrated in the detailed claim charts below, these references alone or in combination 
              anticipate and/or render obvious all elements of the challenged claims.
            </p>
          </div>
        </div>

        {/* Section III */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-[#00A3E1]">III. BACKGROUND OF THE &apos;{patent.short_name} PATENT</h3>
          <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-4">
            <p>
              The &apos;{patent.short_name} patent is directed to &quot;{patent.title}&quot; — a protective cover 
              for a portable electronic device with integrated charging and docking functionality.
            </p>
            <p>
              <strong>Patent Details:</strong>
            </p>
            <ul className="list-disc pl-6">
              <li>Patent Number: {patent.patent_number}</li>
              <li>Issue Date: {new Date(patent.issue_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</li>
              <li>Filing Date: {new Date(patent.filing_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</li>
              <li>Assignee: {patent.assignee}</li>
              <li>Independent Claims: {patent.independentClaims}</li>
            </ul>
            <p>
              <strong>Claims at Issue:</strong> This request challenges all claims of the &apos;{patent.short_name} patent. 
              Representative independent claims are analyzed in detail below.
            </p>
          </div>
        </div>

        {/* Section IV */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-[#00A3E1]">IV. SUMMARY OF PRIOR ART</h3>
          <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-4">
            
            {patent.prior_art.map((ref, index) => (
              <div key={index}>
                <h4 className="text-white font-semibold">
                  {index + 1}. {ref.patent_number ? `${ref.name} (${ref.patent_number})` : ref.name}
                </h4>
                <p className="text-sm mt-1">{ref.relevance}</p>
              </div>
            ))}

            <p className="pt-4">
              The prior art references identified above collectively disclose each and every element 
              of the claimed invention, either explicitly or in combination, rendering all claims 
              anticipated under 35 U.S.C. § 102 and/or obvious under 35 U.S.C. § 103.
            </p>
          </div>
        </div>

        {/* Section V */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-[#00A3E1]">V. CLAIM CONSTRUCTION</h3>
          <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-4">
            <p>
              For purposes of this reexamination request, the claim terms are given their plain and 
              ordinary meaning as understood by a person of ordinary skill in the art at the time of invention.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>&quot;Protective cover/case&quot;</strong> — A protective structure that at least partially surrounds and protects a portable electronic device.</li>
              <li><strong>&quot;Panel&quot;</strong> — A substantially planar surface forming part of the protective structure.</li>
              <li><strong>&quot;Skirt&quot;</strong> — A peripheral portion extending from the panel that provides additional protection.</li>
              <li><strong>&quot;Male plug&quot;</strong> — An electrical connector with protruding contacts configured to interface with a device port.</li>
              <li><strong>&quot;Contactors/Contactors&quot;</strong> — Electrical contact points for transferring power and/or signals.</li>
              <li><strong>&quot;Adapter&quot;</strong> — A structure that converts or transforms the connection from one device port type to another.</li>
              <li><strong>&quot;Docking&quot;</strong> — The physical and electrical connection between a portable device (in its protective cover) and a charging/data station.</li>
            </ul>
          </div>
        </div>

        {/* Section VI - Claim Charts */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-[#00A3E1]">VI. DETAILED CLAIM ANALYSIS</h3>
          
          {/* Claim 1 */}
          <div className="mb-8">
            <h4 className="text-white font-semibold mb-4">{patent.claim1Label} — Element-by-Element Analysis</h4>
            <p className="text-sm text-gray-400 mb-4">{patent.claim1Description}</p>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#00A3E1]/10">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#00A3E1] uppercase w-24">Element</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#00A3E1] uppercase">Claim Limitation</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#00A3E1] uppercase">Prior Art Disclosure</th>
                  </tr>
                </thead>
                <tbody>
                  {patent.claim1Elements.map((element, index) => (
                    <tr key={index} className="border-t border-white/[0.08]">
                      <td className="px-4 py-3 font-mono text-[#00A3E1] text-xs">{element.id}</td>
                      <td className="px-4 py-3 text-gray-300 text-sm">{element.text}</td>
                      <td className="px-4 py-3 text-gray-400 text-sm">{element.prior_art_coverage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Claim 2 */}
          <div className="mb-8">
            <h4 className="text-white font-semibold mb-4">{patent.claim2Label} — Element-by-Element Analysis</h4>
            <p className="text-sm text-gray-400 mb-4">{patent.claim2Description}</p>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#00A3E1]/10">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#00A3E1] uppercase w-24">Element</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#00A3E1] uppercase">Claim Limitation</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#00A3E1] uppercase">Prior Art Disclosure</th>
                  </tr>
                </thead>
                <tbody>
                  {patent.claim2Elements.map((element, index) => (
                    <tr key={index} className="border-t border-white/[0.08]">
                      <td className="px-4 py-3 font-mono text-[#00A3E1] text-xs">{element.id}</td>
                      <td className="px-4 py-3 text-gray-300 text-sm">{element.text}</td>
                      <td className="px-4 py-3 text-gray-400 text-sm">{element.prior_art_coverage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Claim 3 (if available) */}
          {patent.claim3Elements && patent.claim3Label && (
            <div className="mb-8">
              <h4 className="text-white font-semibold mb-4">{patent.claim3Label} — Element-by-Element Analysis</h4>
              <p className="text-sm text-gray-400 mb-4">{patent.claim3Description}</p>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#00A3E1]/10">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#00A3E1] uppercase w-24">Element</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#00A3E1] uppercase">Claim Limitation</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#00A3E1] uppercase">Prior Art Disclosure</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patent.claim3Elements.map((element, index) => (
                      <tr key={index} className="border-t border-white/[0.08]">
                        <td className="px-4 py-3 font-mono text-[#00A3E1] text-xs">{element.id}</td>
                        <td className="px-4 py-3 text-gray-300 text-sm">{element.text}</td>
                        <td className="px-4 py-3 text-gray-400 text-sm">{element.prior_art_coverage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Section VII */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-[#00A3E1]">VII. CONCLUSION</h3>
          <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-4">
            <p>
              For the foregoing reasons, Requester respectfully submits that the prior art references 
              identified herein raise substantial new questions of patentability as to all claims of 
              {patent.patent_number}.
            </p>
            <p>
              The cited prior art, standing alone or in obvious combination, discloses each and every 
              element of the challenged claims. Accordingly, all claims are invalid as anticipated 
              under 35 U.S.C. § 102 and/or obvious under 35 U.S.C. § 103.
            </p>
            <p>
              Requester respectfully requests that reexamination be ordered and that all claims of the 
              &apos;{patent.short_name} patent be rejected and ultimately cancelled.
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-sm text-gray-500 mt-8 pt-6 border-t border-white/[0.08]">
          <p>DRAFT — For Review Purposes Only</p>
          <p className="mt-2">NPI Patent Tracker • Sonance Legal</p>
          <p className="mt-1 text-xs">Generated: {formattedDate}</p>
        </footer>
      </div>
    </div>
  )
}
