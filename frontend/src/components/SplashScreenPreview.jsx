/**
 * SPLASH SCREEN PREVIEW COMPONENT
 * Use this to test different splash screen versions side by side
 *
 * Usage in App.jsx:
 * import { SplashScreenPreview } from './components/SplashScreenPreview';
 * <SplashScreenPreview />
 */

import { useState } from 'react'
import { Button } from './ui/button'
import SplashScreen from './SplashScreen'
import SplashScreenWithCustomLogo from './SplashScreenWithCustomLogo'

export function SplashScreenPreview() {
  const [showVersion1, setShowVersion1] = useState(false)
  const [showVersion2, setShowVersion2] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-950 dark:to-zinc-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🎬 TORIMO Splash Screen Preview
          </h1>
          <p className="text-gray-600 dark:text-zinc-400">
            Click the buttons below to preview different splash screen versions
          </p>
        </div>

        {/* Version Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Version 1: Icon-Based */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Version 1: Icon-Based
                </h3>
                <p className="text-sm text-gray-600 dark:text-zinc-400">
                  Uses Lucide React icons (Apple + Leaf)
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs px-3 py-1 rounded-full font-medium">
                ACTIVE
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-zinc-400">
                <span className="text-green-500">✓</span>
                <span>No external images needed</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-zinc-400">
                <span className="text-green-500">✓</span>
                <span>Apple + Leaf icon combo</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-zinc-400">
                <span className="text-green-500">✓</span>
                <span>Fully animated</span>
              </div>
            </div>

            <Button
              onClick={() => setShowVersion1(true)}
              className="w-full bg-[#34C759] dark:bg-[#00ff41] hover:bg-[#2fb350] dark:hover:bg-[#00cc33] text-white dark:text-zinc-950 rounded-xl"
            >
              Preview Version 1
            </Button>
          </div>

          {/* Version 2: Custom SVG Logo */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Version 2: Custom SVG
                </h3>
                <p className="text-sm text-gray-600 dark:text-zinc-400">
                  Custom animated TORIMO logo
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs px-3 py-1 rounded-full font-medium">
                NEW
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-zinc-400">
                <span className="text-green-500">✓</span>
                <span>Custom SVG apple logo</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-zinc-400">
                <span className="text-green-500">✓</span>
                <span>Animated leaf & heart</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-zinc-400">
                <span className="text-green-500">✓</span>
                <span>Professional branding</span>
              </div>
            </div>

            <Button
              onClick={() => setShowVersion2(true)}
              className="w-full bg-[#34C759] dark:bg-[#00ff41] hover:bg-[#2fb350] dark:hover:bg-[#00cc33] text-white dark:text-zinc-950 rounded-xl"
            >
              Preview Version 2
            </Button>
          </div>
        </div>

        {/* Feature Comparison Table */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-zinc-800">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Feature Comparison
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-zinc-800">
                  <th className="text-left py-3 px-4 text-gray-700 dark:text-zinc-300 font-medium">
                    Feature
                  </th>
                  <th className="text-center py-3 px-4 text-gray-700 dark:text-zinc-300 font-medium">
                    Version 1
                  </th>
                  <th className="text-center py-3 px-4 text-gray-700 dark:text-zinc-300 font-medium">
                    Version 2
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-gray-100 dark:border-zinc-800/50">
                  <td className="py-3 px-4 text-gray-600 dark:text-zinc-400">
                    Logo Type
                  </td>
                  <td className="py-3 px-4 text-center text-gray-900 dark:text-white">
                    Lucide Icons
                  </td>
                  <td className="py-3 px-4 text-center text-gray-900 dark:text-white">
                    Custom SVG
                  </td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-zinc-800/50">
                  <td className="py-3 px-4 text-gray-600 dark:text-zinc-400">
                    Animation
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-green-600 dark:text-green-400">✓</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-green-600 dark:text-green-400">✓</span>
                  </td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-zinc-800/50">
                  <td className="py-3 px-4 text-gray-600 dark:text-zinc-400">
                    External Files
                  </td>
                  <td className="py-3 px-4 text-center text-gray-900 dark:text-white">
                    None
                  </td>
                  <td className="py-3 px-4 text-center text-gray-900 dark:text-white">
                    None
                  </td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-zinc-800/50">
                  <td className="py-3 px-4 text-gray-600 dark:text-zinc-400">
                    Customizable
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-green-600 dark:text-green-400">✓</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-green-600 dark:text-green-400">✓</span>
                  </td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-zinc-800/50">
                  <td className="py-3 px-4 text-gray-600 dark:text-zinc-400">
                    Particles
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-green-600 dark:text-green-400">✓</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-green-600 dark:text-green-400">✓</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-600 dark:text-zinc-400">
                    Loading Bar
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-green-600 dark:text-green-400">✓</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-green-600 dark:text-green-400">✓</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-blue-900 dark:text-blue-400 mb-3">
            💡 How to Switch Versions
          </h3>
          <p className="text-blue-800 dark:text-blue-300 mb-4">
            To use Version 2 (Custom SVG Logo), update your App.jsx:
          </p>
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 font-mono text-sm">
            <code className="text-gray-800 dark:text-gray-200">
              <span className="text-purple-600 dark:text-purple-400">import</span>{' '}
              {'{ SplashScreen }'} <span className="text-purple-600 dark:text-purple-400">from</span>{' '}
              <span className="text-green-600 dark:text-green-400">'./components/SplashScreenWithCustomLogo'</span>;
            </code>
          </div>
        </div>
      </div>

      {/* Render Splash Screens */}
      <SplashScreen isOpen={showVersion1} onComplete={() => setShowVersion1(false)} />

      <SplashScreenWithCustomLogo
        isOpen={showVersion2}
        onComplete={() => setShowVersion2(false)}
      />
    </div>
  )
}
