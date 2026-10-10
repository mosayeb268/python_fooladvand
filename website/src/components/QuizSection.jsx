import React, { useState } from 'react'
import { HelpCircle, CheckCircle2, XCircle, RefreshCw, Trophy, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react'
import quizQuestions from '../data/quiz.json'

export default function QuizSection() {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [showExplanation, setShowExplanation] = useState({})
  const [quizFinished, setQuizFinished] = useState(false)

  const currentQ = quizQuestions[currentIdx]

  const handleSelectOption = (optIdx) => {
    if (selectedAnswers[currentQ.id] !== undefined) return // already answered
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQ.id]: optIdx
    })
    setShowExplanation({
      ...showExplanation,
      [currentQ.id]: true
    })
  }

  const handleReset = () => {
    setSelectedAnswers({})
    setShowExplanation({})
    setCurrentIdx(0)
    setQuizFinished(false)
  }

  // Calculate score
  const score = Object.entries(selectedAnswers).reduce((acc, [qId, ansIdx]) => {
    const q = quizQuestions.find(item => item.id === qId)
    return q && q.correctIndex === ansIdx ? acc + 1 : acc
  }, 0)

  const answeredCount = Object.keys(selectedAnswers).length

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-100 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-cyan-400" />
            <span>آزمون خودآزمایی و سنجش مفاهیم درس (PDA Quiz)</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            سنجش تسلط بر مباحث نام‌پای، پانداس، ساختارهای توالی، متدهای پاکسازی داده و تحلیل دیتاست‌ها
          </p>
        </div>

        {/* Progress & Reset */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-slate-800 text-cyan-400 border border-slate-700">
            {answeredCount} از {quizQuestions.length} پاسخ داده شده
          </span>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>شروع مجدد</span>
          </button>
        </div>
      </div>

      {/* Score Summary Banner if finished or progress */}
      {answeredCount === quizQuestions.length && (
        <div className="rounded-2xl bg-gradient-to-r from-cyan-950/70 via-slate-900 to-blue-950/70 border border-cyan-500/40 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">نتیجه آزمون شما: {score} از {quizQuestions.length} صحیح!</h3>
              <p className="text-xs text-slate-300 mt-0.5">
                {score >= 7 ? 'عالی! تسلط بسیار خوبی بر مفاهیم پایتون و تحلیل داده دارید.' : 'خوب بود! با مرور نوت‌بوک‌ها و جزوات می‌توانید نمره کامل کسب کنید.'}
              </p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md"
          >
            آزمون دوباره
          </button>
        </div>
      )}

      {/* Main Question Card */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 md:p-8 space-y-6 shadow-xl">
        {/* Question Header */}
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-slate-800 text-cyan-400 border border-slate-700">
            سوال {currentIdx + 1} از {quizQuestions.length}
          </span>

          {/* Quick jump dots */}
          <div className="flex items-center gap-1.5">
            {quizQuestions.map((q, idx) => {
              const answered = selectedAnswers[q.id] !== undefined
              const isCorrect = selectedAnswers[q.id] === q.correctIndex
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIdx(idx)}
                  className={`w-6 h-6 rounded-md text-[11px] font-mono font-bold transition-all ${
                    idx === currentIdx
                      ? 'ring-2 ring-cyan-400 bg-slate-700 text-white'
                      : answered
                        ? isCorrect
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {idx + 1}
                </button>
              )
            })}
          </div>
        </div>

        {/* Question Text */}
        <h3 className="text-base md:text-lg font-bold text-white leading-relaxed">
          {currentQ.question}
        </h3>

        {/* Options */}
        <div className="space-y-3">
          {currentQ.options.map((opt, oIdx) => {
            const hasAnswered = selectedAnswers[currentQ.id] !== undefined
            const isUserSelected = selectedAnswers[currentQ.id] === oIdx
            const isCorrectOption = currentQ.correctIndex === oIdx

            let style = 'bg-slate-950/60 hover:bg-slate-800/80 border-slate-800 text-slate-200'

            if (hasAnswered) {
              if (isCorrectOption) {
                style = 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300'
              } else if (isUserSelected) {
                style = 'bg-rose-950/50 border-rose-500/50 text-rose-300'
              } else {
                style = 'bg-slate-950/40 border-slate-800/50 text-slate-500 opacity-60'
              }
            }

            return (
              <div
                key={oIdx}
                onClick={() => handleSelectOption(oIdx)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-xs md:text-sm ${style}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-slate-800/80 flex items-center justify-center font-mono text-xs text-slate-300 shrink-0">
                    {oIdx + 1}
                  </span>
                  <span className="leading-relaxed">{opt}</span>
                </div>

                {hasAnswered && (
                  <div>
                    {isCorrectOption && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                    {isUserSelected && !isCorrectOption && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Explanation Box */}
        {showExplanation[currentQ.id] && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 animate-in fade-in duration-200">
            <div className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>پاسخ تشریحی و نکته درسی:</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {currentQ.explanation}
            </p>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => setCurrentIdx(prev => Math.max(prev - 1, 0))}
            disabled={currentIdx === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium disabled:opacity-40 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>سوال قبلی</span>
          </button>

          <button
            onClick={() => setCurrentIdx(prev => Math.min(prev + 1, quizQuestions.length - 1))}
            disabled={currentIdx === quizQuestions.length - 1}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold disabled:opacity-40 transition-colors shadow-md shadow-cyan-600/20"
          >
            <span>سوال بعدی</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  )
}
