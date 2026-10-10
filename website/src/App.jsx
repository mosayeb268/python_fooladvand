import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import A4BookletView from './components/A4BookletView'
import StatsBanner from './components/StatsBanner'
import TimelineRoadmap from './components/TimelineRoadmap'
import CheatSheetSection from './components/CheatSheetSection'
import PdfSection from './components/PdfSection'
import PdfModal from './components/PdfModal'
import PythonScriptsSection from './components/PythonScriptsSection'
import NotebooksSection from './components/NotebooksSection'
import DatasetsSection from './components/DatasetsSection'
import QuizSection from './components/QuizSection'
import AboutSection from './components/AboutSection'
import SearchModal from './components/SearchModal'
import Footer from './components/Footer'
import pdfsData from './data/pdfs.json'

export default function App() {
  const [activeTab, setActiveTab] = useState('a4booklet') // Default: Exactly matching the user's requested A4 Booklet template!
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [selectedPdf, setSelectedPdf] = useState(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  // Sync theme class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
      document.body.className = 'bg-slate-950 text-slate-100 antialiased'
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
      document.body.className = 'bg-slate-200 text-slate-900 antialiased'
    }
  }, [isDarkMode])

  // Handle click on any item from Timeline Roadmap (01 to 21)
  const handleSelectTimelineItem = (item) => {
    if (item.type === 'pdf') {
      const foundPdf = pdfsData.find(p => p.filename === item.file)
      if (foundPdf) {
        setSelectedPdf(foundPdf)
      } else {
        setActiveTab('pdfs')
      }
    } else if (item.type === 'scripts') {
      setActiveTab('scripts')
    } else if (item.type === 'notebook') {
      setActiveTab('notebooks')
    } else if (item.type === 'dataset') {
      setActiveTab('datasets')
    }
  }

  // Handle selection from Search Modal
  const handleSelectSearchResult = (type, payload) => {
    if (type === 'pdfs') {
      setSelectedPdf(payload)
      setActiveTab('pdfs')
    } else {
      setActiveTab(type)
    }
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-300 text-slate-900'}`}>
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSearch={() => setIsSearchOpen(true)}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />

      {/* Main Container */}
      <main className="flex-1 w-full">
        
        {/* PRIMARY VIEW: A4 Educational Booklet with Interactive Python IDE */}
        {activeTab === 'a4booklet' && (
          <A4BookletView onOpenPdf={(pdf) => setSelectedPdf(pdf)} />
        )}

        {/* TAB 2: Dashboard & Roadmap */}
        {activeTab === 'dashboard' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-in fade-in duration-200">
            <StatsBanner onSelectTab={(tab) => setActiveTab(tab)} />
            <TimelineRoadmap onSelectContent={handleSelectTimelineItem} />
          </div>
        )}

        {/* TAB 3: Cheat Sheet & Code Snippets */}
        {activeTab === 'cheatsheet' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
            <CheatSheetSection />
          </div>
        )}

        {/* TAB 4: PDFs */}
        {activeTab === 'pdfs' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
            <PdfSection onOpenPdf={(pdf) => setSelectedPdf(pdf)} />
          </div>
        )}

        {/* TAB 5: Python Scripts */}
        {activeTab === 'scripts' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
            <PythonScriptsSection />
          </div>
        )}

        {/* TAB 6: Jupyter Notebooks */}
        {activeTab === 'notebooks' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
            <NotebooksSection />
          </div>
        )}

        {/* TAB 7: Datasets */}
        {activeTab === 'datasets' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
            <DatasetsSection />
          </div>
        )}

        {/* TAB 8: Self-Assessment Quiz */}
        {activeTab === 'quiz' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
            <QuizSection />
          </div>
        )}

        {/* TAB 9: About Course */}
        {activeTab === 'about' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
            <AboutSection onOpenPdf={(pdf) => setSelectedPdf(pdf)} />
          </div>
        )}

      </main>

      {/* Global Modals */}
      <PdfModal
        pdf={selectedPdf}
        onClose={() => setSelectedPdf(null)}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectResult={handleSelectSearchResult}
      />

      {/* Footer */}
      <Footer onSelectTab={(tab) => setActiveTab(tab)} />

    </div>
  )
}
