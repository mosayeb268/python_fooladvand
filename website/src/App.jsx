import React, { useState, useEffect, lazy, Suspense } from 'react'
import Navbar from './components/Navbar'
import A4BookletView from './components/A4BookletView'
import StatsBanner from './components/StatsBanner'
import PdfModal from './components/PdfModal'
import Footer from './components/Footer'
import pdfsData from './data/pdfs.json'

// Code-split heavy secondary tabs to optimize tablet load time & bundle chunks
const TimelineRoadmap = lazy(() => import('./components/TimelineRoadmap'))
const CheatSheetSection = lazy(() => import('./components/CheatSheetSection'))
const PdfSection = lazy(() => import('./components/PdfSection'))
const PythonScriptsSection = lazy(() => import('./components/PythonScriptsSection'))
const NotebooksSection = lazy(() => import('./components/NotebooksSection'))
const DatasetsSection = lazy(() => import('./components/DatasetsSection'))
const QuizSection = lazy(() => import('./components/QuizSection'))
const AboutSection = lazy(() => import('./components/AboutSection'))
const SearchModal = lazy(() => import('./components/SearchModal'))
const InteractiveIDE = lazy(() => import('./components/InteractiveIDE'))

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

  const renderTabFallback = () => (
    <div className="flex items-center justify-center py-20 text-slate-400 text-sm font-sans">
      <div className="flex items-center gap-3">
        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
        <span>در حال بارگذاری بخش مورد نظر...</span>
      </div>
    </div>
  )

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

        <Suspense fallback={renderTabFallback()}>
          {/* TAB: Full Interactive Python IDE Studio */}
          {activeTab === 'ide' && (
            <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 h-[calc(100vh-5rem)] animate-in fade-in duration-200">
              <InteractiveIDE isEmbedded={true} />
            </div>
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

          {/* Search Modal */}
          {isSearchOpen && (
            <SearchModal
              isOpen={isSearchOpen}
              onClose={() => setIsSearchOpen(false)}
              onSelectResult={handleSelectSearchResult}
            />
          )}
        </Suspense>

      </main>

      {/* Global Modals */}
      <PdfModal
        pdf={selectedPdf}
        onClose={() => setSelectedPdf(null)}
      />

      {/* Footer */}
      <Footer onSelectTab={(tab) => setActiveTab(tab)} />

    </div>
  )
}
