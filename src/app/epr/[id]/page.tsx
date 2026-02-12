import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPatentData, PATENT_DATA } from '@/lib/patent-data'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateStaticParams() {
  // Only generate EPR pages for patents that have drafts
  return [{ id: '275' }]
}

export default async function EPRDraftPage({ params }: PageProps) {
  const { id } = await params
  const patent = getPatentData(id)
  
  if (!patent || id !== '275') {
    notFound()
  }

  return (
    <div className="min-h-screen bg-[#1a1f24] text-white">
      <div className="max-w-4xl mx-auto px-6 py-10">
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
            href={`/patents/${id}`}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Patent Analysis
          </Link>
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
          <h2 className="text-xl text-gray-300 mb-4">U.S. Patent No. 10,778,275</h2>
          <div className="text-sm text-gray-400">
            <p>Attorney Docket No.: [TO BE ASSIGNED]</p>
            <p>Prepared: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-[#00A3E1]">TABLE OF CONTENTS</h3>
          <div className="space-y-2 text-sm">
            <p className="hover:text-[#00A3E1] cursor-pointer">I. Introduction</p>
            <p className="hover:text-[#00A3E1] cursor-pointer">II. Statement of Substantial New Question of Patentability</p>
            <p className="hover:text-[#00A3E1] cursor-pointer">III. Background of the &apos;275 Patent</p>
            <p className="hover:text-[#00A3E1] cursor-pointer">IV. Summary of Prior Art</p>
            <p className="hover:text-[#00A3E1] cursor-pointer">V. Claim Construction</p>
            <p className="hover:text-[#00A3E1] cursor-pointer">VI. Detailed Claim Analysis</p>
            <p className="hover:text-[#00A3E1] cursor-pointer">VII. Conclusion</p>
            <p className="hover:text-[#00A3E1] cursor-pointer">Exhibit A: Claim Charts</p>
          </div>
        </div>

        {/* Section I */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-[#00A3E1]">I. INTRODUCTION</h3>
          <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-4">
            <p>
              Pursuant to 35 U.S.C. §§ 302-307 and 37 C.F.R. § 1.510, Requester respectfully requests 
              ex parte reexamination of claims 1-20 of U.S. Patent No. 10,778,275 (&quot;the &apos;275 patent&quot;), 
              entitled &quot;Docking Sleeve with Electrical Adapter,&quot; issued on September 15, 2020 to 
              National Products, Inc.
            </p>
            <p>
              This request is based on substantial new questions of patentability raised by prior art 
              patents and printed publications that were not considered during the original prosecution 
              of the &apos;275 patent. As detailed below, this prior art anticipates and/or renders obvious 
              all challenged claims.
            </p>
            <p>
              The filing fee of $12,600.00 pursuant to 37 C.F.R. § 1.20(c)(1) is submitted herewith.
            </p>
          </div>
        </div>

        {/* Section II */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-[#00A3E1]">II. STATEMENT OF SUBSTANTIAL NEW QUESTION OF PATENTABILITY</h3>
          <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-4">
            <p>
              The following prior art references raise substantial new questions of patentability 
              as to claims 1-20 of the &apos;275 patent:
            </p>
            
            <div className="bg-white/[0.02] rounded-xl p-4 space-y-3">
              <div className="border-l-2 border-[#00A3E1] pl-4">
                <p className="font-semibold text-white">U.S. Patent No. 9,019,698 (&quot;Thiers&quot;)</p>
                <p className="text-sm">Filed: March 15, 2013 | Issued: April 28, 2015</p>
                <p className="text-sm mt-1">Primary reference disclosing protective case with dock interface assembly, alignment features, and electrical contactors.</p>
              </div>
              
              <div className="border-l-2 border-[#00A3E1] pl-4">
                <p className="font-semibold text-white">U.S. Patent No. 8,553,408 (&quot;Supran &apos;408&quot;)</p>
                <p className="text-sm">Priority: September 6, 2011 | Issued: October 8, 2013</p>
                <p className="text-sm mt-1">Dana Innovations patent disclosing protective sleeve with conductive charging and docking system.</p>
              </div>
              
              <div className="border-l-2 border-[#00A3E1] pl-4">
                <p className="font-semibold text-white">U.S. Patent No. 8,553,416 (&quot;Supran &apos;416&quot;)</p>
                <p className="text-sm">Priority: September 6, 2011 | Issued: October 8, 2013</p>
                <p className="text-sm mt-1">Dana Innovations patent disclosing magnetic coupling and conductive charging for docking systems.</p>
              </div>

              <div className="border-l-2 border-[#00B2A9] pl-4">
                <p className="font-semibold text-white">iPort Charge Case and Stand (November 2013)</p>
                <p className="text-sm">Commercial Product — Dana Innovations</p>
                <p className="text-sm mt-1">Product featuring raised conductive contacts on protective case that mate with dock contacts via magnetic alignment. Predates &apos;275 priority by 3+ months.</p>
              </div>

              <div className="border-l-2 border-[#00B2A9] pl-4">
                <p className="font-semibold text-white">Duracell myGrid Charging System (2009)</p>
                <p className="text-sm">Commercial Product</p>
                <p className="text-sm mt-1">Power Sleeve with four metal contacts on back that interface with charging pad surface.</p>
              </div>

              <div className="border-l-2 border-[#00B2A9] pl-4">
                <p className="font-semibold text-white">Mophie Juice Pack and Charging Dock (2011)</p>
                <p className="text-sm">Commercial Product</p>
                <p className="text-sm mt-1">Battery case with pogo pin contacts on exterior that interface with dedicated charging dock.</p>
              </div>
            </div>

            <p>
              These references were not cited or considered during prosecution of the &apos;275 patent. 
              As demonstrated in the detailed claim charts below, these references alone or in combination 
              anticipate and/or render obvious all elements of claims 1-20.
            </p>
          </div>
        </div>

        {/* Section III */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-[#00A3E1]">III. BACKGROUND OF THE &apos;275 PATENT</h3>
          <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-4">
            <p>
              The &apos;275 patent is directed to a &quot;Docking Sleeve with Electrical Adapter&quot; — essentially 
              a protective cover for a portable electronic device that includes an adapter with a male plug 
              for connecting to the device and contactors exposed on the exterior of the cover for interfacing 
              with a docking station.
            </p>
            <p>
              The patent claims priority to a provisional application filed February 24, 2014. However, 
              as demonstrated herein, the claimed subject matter was well-known in the art years before 
              this priority date, as evidenced by both patent literature and commercial products in the market.
            </p>
            <p>
              <strong>Claims at Issue:</strong> This request challenges all claims (1-20) of the &apos;275 patent. 
              Independent claims 1 and 19 are representative.
            </p>
          </div>
        </div>

        {/* Section IV */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-[#00A3E1]">IV. SUMMARY OF PRIOR ART</h3>
          <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-4">
            
            <h4 className="text-white font-semibold">A. Thiers (U.S. Patent No. 9,019,698)</h4>
            <p>
              Thiers discloses a protective case for a portable electronic device with an integrated dock 
              interface assembly. The case includes a rear cover (panel), surrounding skirt, and an electrical 
              adapter with a male plug that connects to the device&apos;s port. Contactors are exposed on the 
              exterior surface for mating with a docking station. See Thiers Figs. 1, 3, 9; col. 9:34-40, 
              col. 10:51-53, claim 18.
            </p>

            <h4 className="text-white font-semibold">B. Supran &apos;408 (U.S. Patent No. 8,553,408)</h4>
            <p>
              Supran &apos;408, assigned to Dana Innovations, discloses a charging docking system with a protective 
              sleeve that receives an electronic device. The sleeve includes conductive charging elements and 
              a dam/alignment feature for positioning on a docking station. See Supran &apos;408 col. 2:14-3:11, 
              col. 9:58-67.
            </p>

            <h4 className="text-white font-semibold">C. Supran &apos;416 (U.S. Patent No. 8,553,416)</h4>
            <p>
              Supran &apos;416, also assigned to Dana Innovations, specifically discloses magnetic coupling 
              for aligning a device sleeve with a docking station, along with conductive charging through 
              exposed contacts. This reference is particularly relevant to claims directed to magnetic 
              alignment features.
            </p>

            <h4 className="text-white font-semibold">D. Commercial Product Prior Art</h4>
            <p>
              The iPort Charge Case and Stand, a Dana Innovations product released in November 2013, 
              embodies the claimed invention. As documented in the iLounge review: &quot;Raised contacts on 
              the dock match those on the back of the case, and they magnetically attach.&quot; This commercial 
              product predates the &apos;275 priority date and demonstrates that the claimed features were 
              already in the marketplace.
            </p>
            <p>
              Similarly, the Duracell myGrid (2009) and Mophie Juice Pack with Dock (2011) demonstrate 
              that protective cases/sleeves with exterior conductive contacts for dock charging were 
              well-known years before the claimed invention.
            </p>
          </div>
        </div>

        {/* Section V */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-[#00A3E1]">V. CLAIM CONSTRUCTION</h3>
          <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-4">
            <p>
              For purposes of this reexamination request, the claim terms are given their plain and 
              ordinary meaning as understood by a person of ordinary skill in the art. Key terms include:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>&quot;Protective cover&quot;</strong> — A case, sleeve, or shell that at least partially surrounds and protects a portable electronic device.</li>
              <li><strong>&quot;Panel&quot;</strong> — A substantially flat surface forming part of the cover.</li>
              <li><strong>&quot;Skirt&quot;</strong> — A peripheral portion surrounding the panel that covers the sides of the device.</li>
              <li><strong>&quot;Male plug&quot;</strong> — An electrical connector with protruding contacts designed to mate with a receptacle on the device.</li>
              <li><strong>&quot;Contactors&quot;</strong> — Electrical contact points exposed on the exterior of the cover for interfacing with a docking station.</li>
              <li><strong>&quot;Female nest&quot;</strong> — A recessed area configured to receive a mating component.</li>
            </ul>
          </div>
        </div>

        {/* Section VI - Claim Charts */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-[#00A3E1]">VI. DETAILED CLAIM ANALYSIS</h3>
          
          <h4 className="text-white font-semibold mb-4">Claim 1 — Element-by-Element Analysis</h4>
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
                    <td className="px-4 py-3 font-mono text-[#00A3E1]">{element.id}</td>
                    <td className="px-4 py-3 text-gray-300">{element.text}</td>
                    <td className="px-4 py-3 text-gray-400">{element.prior_art_coverage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h4 className="text-white font-semibold mb-4 mt-8">Claim 19 — Element-by-Element Analysis</h4>
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
                    <td className="px-4 py-3 font-mono text-[#00A3E1]">{element.id}</td>
                    <td className="px-4 py-3 text-gray-300">{element.text}</td>
                    <td className="px-4 py-3 text-gray-400">{element.prior_art_coverage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section VII */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-[#00A3E1]">VII. CONCLUSION</h3>
          <div className="prose prose-invert prose-sm max-w-none text-gray-300 space-y-4">
            <p>
              For the foregoing reasons, Requester respectfully submits that the prior art references 
              identified herein raise substantial new questions of patentability as to claims 1-20 of 
              U.S. Patent No. 10,778,275.
            </p>
            <p>
              The cited prior art, including Thiers, Supran &apos;408, Supran &apos;416, and commercial products 
              such as the iPort Charge Case and Stand, Duracell myGrid, and Mophie Juice Pack with Dock, 
              disclose each and every element of the challenged claims, either alone or in obvious combination.
            </p>
            <p>
              Requester respectfully requests that reexamination be ordered and that claims 1-20 of the 
              &apos;275 patent be rejected as anticipated under 35 U.S.C. § 102 and/or obvious under 35 U.S.C. § 103.
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-sm text-gray-500 mt-8 pt-6 border-t border-white/[0.08]">
          <p>DRAFT — For Review Purposes Only</p>
          <p className="mt-2">NPI Patent Tracker • Sonance Legal</p>
        </footer>
      </div>
    </div>
  )
}
