/**
 * Professional Python Execution Engine (Pyodide WebAssembly + Data Science Stack)
 * 
 * Features:
 * - Real WebAssembly Python 3.12+ execution via Pyodide
 * - Native support for NumPy, Pandas, Matplotlib, SciPy
 * - True Interactive Inline input() Handling via Python AST Transformation & Async/Await Promise Bridge
 * - Virtual File System (Emscripten FS) pre-mounted with course datasets (Employees.csv, titanic.csv, m1.py)
 * - Matplotlib Figure Interceptor (extracts plots as Base64 images)
 * - Variable Memory Inspector (extracts active variables for debugger table)
 * - Live REPL Expression Evaluator
 * - Clean Traceback Formatting
 */

const EMPLOYEES_CSV = `ID,Name,Family,Gender,Age,City,Degree,Speciality,Workday,Salary
1001,ali,nosrati,male,41.0,tehran,Bachelor,computer,21,4500
1290,reza,bahmani,male,34.0,yazd,Bachelor,-,18,3400
1211,zahra,farhadi,female,,tehran,Master,physics,19,3900
1599,hadis,sohrabi,female,25.0,?,Bachelor,computer,28,4800
1441,saber,tohidi,male,32.0,khorramabad,PhD,art,14,5800
1733,kazem,yari,male,0.0,kashan,,law,10,3100
1930,fatemeh,bagheri,female,50.0,tehran,Master,accounting,20,5500
1322,bahram,karimi,male,21.0,yazd,Bachelor,art,25,5200
1870,narges,rahmati,female,37.0,kashan,Master,computer,23,5900
1655,hamed,sadeghi,male,49.0,n.a.,PhD,physics,19,6300`

const M1_MODULE = `def rectangle(a, b):
    return a * b

def triangle(l, h):
    return (l * h) / 2

def cube(l, w, h):
    return l * w * h
`

let pyodideInstance = null
let pyodideLoadingPromise = null
let pyodideStatus = 'idle' // 'idle' | 'loading' | 'ready' | 'failed'
let statusListeners = []
let titanicCsvData = null

export function onPyodideStatusChange(listener) {
  statusListeners.push(listener)
  return () => {
    statusListeners = statusListeners.filter(l => l !== listener)
  }
}

function notifyStatus(status, detail = '') {
  pyodideStatus = status
  statusListeners.forEach(l => l(status, detail))
}

export function getPyodideStatus() {
  return pyodideStatus
}

/**
 * Mount course datasets and helper modules to Pyodide Virtual Filesystem
 */
async function mountVirtualFilesystem(pyodide) {
  try {
    if (!pyodide || !pyodide.FS) return

    // 1. Mount Employees.csv
    pyodide.FS.writeFile('/16-Employees.csv', EMPLOYEES_CSV)
    pyodide.FS.writeFile('/Employees.csv', EMPLOYEES_CSV)

    // 2. Mount m1.py module (from chapter 3/4)
    pyodide.FS.writeFile('/m1.py', M1_MODULE)

    // 3. Mount titanic.csv
    if (!titanicCsvData) {
      try {
        const resp = await fetch('/datasets/21-titanic.csv')
        if (resp.ok) {
          titanicCsvData = await resp.text()
        }
      } catch (err) {
        console.warn('Could not fetch titanic.csv via network:', err)
      }
    }

    if (titanicCsvData) {
      pyodide.FS.writeFile('/21-titanic.csv', titanicCsvData)
      pyodide.FS.writeFile('/titanic.csv', titanicCsvData)
    }
  } catch (fsErr) {
    console.warn('Virtual filesystem mounting note:', fsErr)
  }
}

/**
 * Initialize Pyodide WebAssembly with resilient CDN loading
 */
export async function initPyodide(onProgress) {
  if (pyodideInstance) return pyodideInstance
  if (pyodideLoadingPromise) return pyodideLoadingPromise

  notifyStatus('loading', 'در حال راه‌اندازی هسته WebAssembly...')
  if (onProgress) onProgress('در حال راه‌اندازی هسته WebAssembly...')

  pyodideLoadingPromise = new Promise((resolve) => {
    (async () => {
      try {
        if (typeof window === 'undefined') {
          notifyStatus('failed', 'محیط پنجره مرورگر در دسترس نیست')
          resolve(null)
          return
        }

        // Check if pyodide script is already loaded
        if (!window.loadPyodide) {
          const script = document.createElement('script')
          script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js'
          script.async = true

          const loadScriptPromise = new Promise((scriptRes, scriptRej) => {
            script.onload = () => scriptRes(true)
            script.onerror = () => scriptRej(new Error('دانلود اسکریپت Pyodide با خطا مواجه شد'))
          })

          document.head.appendChild(script)
          await loadScriptPromise
        }

        if (onProgress) onProgress('در حال بارگذاری مفسر WebAssembly پایتون...')
        notifyStatus('loading', 'در حال کامپایل باینری‌های WebAssembly...')

        const pyodide = await window.loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/'
        })

        // Mount Virtual Filesystem
        if (onProgress) onProgress('در حال سوار کردن دیتاست‌های آموزشی (Employees & Titanic)...')
        await mountVirtualFilesystem(pyodide)

        // Preload numpy & pandas in the background for zero-latency execution
        if (onProgress) onProgress('در حال آماده‌سازی کتابخانه‌های علم داده (NumPy & Pandas)...')
        try {
          await pyodide.loadPackage(['numpy', 'pandas'])
        } catch (pkgErr) {
          console.warn('Preload packages note:', pkgErr)
        }

        pyodideInstance = pyodide
        notifyStatus('ready', '🟢 موتور پایتون ۳ و کتابخانه‌های تحلیل داده آماده اجراست')
        if (onProgress) onProgress('موتور پایتون ۳ آماده اجراست.')
        resolve(pyodide)

      } catch (err) {
        console.warn('Pyodide initialization caught error:', err)
        notifyStatus('failed', err.message || 'خطا در بارگذاری هسته WebAssembly')
        resolve(null)
      }
    })()
  })

  return pyodideLoadingPromise
}

/**
 * Clean up Python Traceback for educational display
 */
function formatTraceback(errMessage) {
  const lines = String(errMessage).split('\n')
  const relevant = []
  let capturing = false

  for (const line of lines) {
    if (line.includes('File "<exec>"') || line.includes('Traceback (most recent call last):') || line.includes('__pda_async_runner__')) {
      capturing = true
    }
    if (capturing) {
      if (!line.includes('/lib/python3') && !line.includes('pyodide.asm') && !line.includes('__pda_async_runner__')) {
        relevant.push(line.replace('File "<exec>", ', '').replace('File "<string>", ', ''))
      }
    }
  }

  if (relevant.length === 0) {
    return [errMessage]
  }
  return relevant
}

/**
 * Execute Python code in the browser with Pyodide (WASM)
 * Supports real-time interactive input(), NumPy, Pandas, Matplotlib plots, and variable extraction
 * 
 * @param {string} code - Python code string
 * @param {string|object} options - either simulated input string OR { onInputPrompt, expectedOutput }
 */
export async function executePython(code, options = '', legacyExpectedOutput = null) {
  // Normalize options for backward compatibility
  let onInputPrompt = null
  let simulatedInputVal = '20'
  let expectedOutput = legacyExpectedOutput

  if (typeof options === 'function') {
    onInputPrompt = options
  } else if (typeof options === 'object' && options !== null) {
    onInputPrompt = options.onInputPrompt || null
    simulatedInputVal = options.userInput || '20'
    expectedOutput = options.expectedOutput || legacyExpectedOutput
  } else if (typeof options === 'string') {
    simulatedInputVal = options
  }

  try {
    const pyodide = pyodideInstance || await initPyodide()

    if (pyodide) {
      // 1. Auto-load imported packages dynamically (e.g. numpy, pandas, matplotlib)
      try {
        await pyodide.loadPackagesFromImports(code)
      } catch (loadPkgErr) {
        console.warn('Auto package loading note:', loadPkgErr)
      }

      // 2. Prepare stdout & stderr buffers
      const outputBuffer = []
      pyodide.setStdout({ batched: (msg) => outputBuffer.push(msg) })
      pyodide.setStderr({ batched: (msg) => outputBuffer.push(`Error: ${msg}`) })

      // 3. Register Global Interactive Input Bridge in JavaScript
      const inputsArray = String(simulatedInputVal).split(/[,|\n]/).map(s => s.trim())
      let simInputIdx = 0

      window.__pda_request_terminal_input = async (promptText) => {
        if (onInputPrompt) {
          // Interactive prompt handler in the IDE terminal
          const userTyped = await onInputPrompt(promptText)
          return String(userTyped ?? '')
        }
        // Fallback to queue of simulated inputs
        if (simInputIdx < inputsArray.length && inputsArray[simInputIdx] !== '') {
          const val = inputsArray[simInputIdx++]
          outputBuffer.push(`[ورودی]: ${val}`)
          return val
        }
        return '20'
      }

      // 4. Construct Python Execution Wrapper with AST Transformer for input()
      const runnerSetup = `
import sys
import builtins
import io
import base64
import ast
import js

# Define async terminal input bridge
async def __async_terminal_input(prompt_msg=""):
    p_str = str(prompt_msg) if prompt_msg else ""
    val = await js.window.__pda_request_terminal_input(p_str)
    return str(val)

# Configure Matplotlib backend
_plots = []
try:
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
except Exception:
    pass

class _PdaInputReplacer(ast.NodeTransformer):
    def __init__(self):
        super().__init__()
        self.in_sync_function = 0

    def visit_FunctionDef(self, node):
        self.in_sync_function += 1
        self.generic_visit(node)
        self.in_sync_function -= 1
        return node

    def visit_AsyncFunctionDef(self, node):
        self.generic_visit(node)
        return node

    def visit_Call(self, node):
        self.generic_visit(node)
        if isinstance(node.func, ast.Name) and node.func.id == 'input':
            if self.in_sync_function == 0:
                return ast.Await(
                    value=ast.Call(
                        func=ast.Name(id='__async_terminal_input', ctx=ast.Load()),
                        args=node.args,
                        keywords=node.keywords
                    )
                )
        return node

def _pda_prepare_code(user_code_str):
    try:
        tree = ast.parse(user_code_str)
        has_input = any(
            isinstance(n, ast.Call) and isinstance(n.func, ast.Name) and n.func.id == 'input'
            for n in ast.walk(tree)
        )
        if not has_input:
            return user_code_str, False

        replacer = _PdaInputReplacer()
        tree = replacer.visit(tree)
        ast.fix_missing_locations(tree)
        return ast.unparse(tree), True
    except Exception as e:
        return user_code_str, False
`
      await pyodide.runPythonAsync(runnerSetup)

      // Transform user code if it contains input()
      const prepareSnippet = `_pda_prepare_code(${JSON.stringify(code)})`
      const preparedResult = await pyodide.runPythonAsync(prepareSnippet)
      let transformedCode = code
      if (preparedResult) {
        try {
          if (typeof preparedResult.toJs === 'function') {
            const resArr = preparedResult.toJs()
            transformedCode = (Array.isArray(resArr) ? resArr[0] : resArr) || code
          } else if (typeof preparedResult.get === 'function') {
            transformedCode = preparedResult.get(0) || code
          } else if (preparedResult[0] !== undefined) {
            transformedCode = preparedResult[0] || code
          }
        } catch {
          transformedCode = code
        } finally {
          if (typeof preparedResult.destroy === 'function') {
            preparedResult.destroy()
          }
        }
      }

      // 5. Execute user code with native top-level await
      const resultVal = await pyodide.runPythonAsync(transformedCode)

      // 6. Collect generated Matplotlib plots
      const collectPlotsScript = `
try:
    import matplotlib.pyplot as plt
    for _fignum in plt.get_fignums():
        _fig = plt.figure(_fignum)
        _buf = io.BytesIO()
        _fig.savefig(_buf, format='png', bbox_inches='tight', dpi=100)
        _buf.seek(0)
        _plots.append('data:image/png;base64,' + base64.b64encode(_buf.read()).decode('ascii'))
    plt.close('all')
except Exception:
    pass
`
      await pyodide.runPythonAsync(collectPlotsScript)

      let plots = []
      try {
        const plotsProxy = pyodide.globals.get('_plots')
        if (plotsProxy) {
          plots = plotsProxy.toJs() || []
          plotsProxy.destroy()
        }
      } catch {
        plots = []
      }

      // 7. Extract Memory Variables
      const extractVarsScript = `
_pda_vars = []
try:
    for _k, _v in list(globals().items()):
        if not _k.startswith('_') and _k not in ['sys', 'builtins', 'io', 'base64', 'ast', 'js', 'matplotlib', 'plt']:
            _v_str = str(_v)
            if len(_v_str) > 75:
                _v_str = _v_str[:72] + '...'
            _pda_vars.append({
                'name': _k,
                'type': type(_v).__name__,
                'value': _v_str
            })
except Exception:
    pass
`
      await pyodide.runPythonAsync(extractVarsScript)

      let variables = []
      try {
        const varsProxy = pyodide.globals.get('_pda_vars')
        if (varsProxy) {
          variables = varsProxy.toJs() || []
          varsProxy.destroy()
        }
      } catch {
        variables = []
      }

      // 8. Format final logs
      const finalLogs = outputBuffer.flatMap(l => l.split('\n')).filter(l => l.length > 0)

      if (finalLogs.length === 0 && resultVal !== undefined && resultVal !== null) {
        finalLogs.push(String(resultVal))
      }

      if (finalLogs.length === 0 && plots.length === 0) {
        finalLogs.push('برنامه با موفقیت اجرا شد (خروجی متنی خالی، Exit Code: 0).')
      }

      return {
        success: true,
        logs: finalLogs,
        plots,
        variables,
        expectedOutput,
        engine: '🟢 مفسر رسمی Pyodide WebAssembly (Python 3.12+)'
      }
    }
  } catch (wasmError) {
    console.warn('WASM execution error:', wasmError)
    const msg = wasmError.message || String(wasmError)

    const formattedLines = formatTraceback(msg)
    return {
      success: false,
      logs: [
        '❌ خطای اجرای پایتون (Python Runtime Error):',
        ...formattedLines
      ],
      plots: [],
      variables: [],
      expectedOutput,
      engine: '🟢 Pyodide WebAssembly'
    }
  }

  return {
    success: false,
    logs: ['موتور WebAssembly در دسترس نیست'],
    plots: [],
    variables: [],
    expectedOutput,
    engine: 'ناموفق'
  }
}

/**
 * Evaluate single REPL expression (e.g. `2 + 2` or `df.shape`)
 */
export async function evaluateReplExpression(expr) {
  try {
    const pyodide = pyodideInstance || await initPyodide()
    if (!pyodide) return { success: false, output: 'موتور پایتون آماده نیست' }

    const res = await pyodide.runPythonAsync(expr)
    return {
      success: true,
      output: res !== undefined ? String(res) : 'None'
    }
  } catch (err) {
    return {
      success: false,
      output: `Error: ${err.message}`
    }
  }
}
