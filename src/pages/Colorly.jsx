import React, { useState, useRef } from 'react'
import { SwatchIcon, PhotoIcon, DocumentDuplicateIcon, ArrowDownTrayIcon, PlusIcon } from '@heroicons/react/24/outline'
import useStore from '../store/useStore'

const Colorly = () => {
  const { tools, updateTool, addNotification } = useStore()
  const colorlyState = tools.colorly
  const fileInputRef = useRef(null)
  const canvasRef = useRef(null)

  const [colorInput, setColorInput] = useState('#3B82F6')
  const [extractedColors, setExtractedColors] = useState([])

  // Color conversion functions
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  const rgbToHex = (r, g, b) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
  }

  const rgbToHsl = (r, g, b) => {
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h, s, l = (max + min) / 2

    if (max === min) {
      h = s = 0
    } else {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h /= 6
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    }
  }

  const getColorFormats = (hex) => {
    const rgb = hexToRgb(hex)
    if (!rgb) return null

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)

    return {
      hex: hex.toUpperCase(),
      rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
      rgba: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`,
      hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
      hsla: `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, 1)`
    }
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      addNotification('Please select a valid image file', 'error')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        extractColorsFromImage(img)
        updateTool('colorly', { imageData: e.target.result })
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  }

  const extractColorsFromImage = (img) => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    // Set canvas size
    const maxSize = 200
    const scale = Math.min(maxSize / img.width, maxSize / img.height)
    canvas.width = img.width * scale
    canvas.height = img.height * scale

    // Draw image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    // Extract colors
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    const colorMap = new Map()

    // Sample every 4th pixel to improve performance
    for (let i = 0; i < data.length; i += 16) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const alpha = data[i + 3]

      if (alpha > 128) { // Skip transparent pixels
        const hex = rgbToHex(r, g, b)
        colorMap.set(hex, (colorMap.get(hex) || 0) + 1)
      }
    }

    // Sort by frequency and take top colors
    const sortedColors = Array.from(colorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([color]) => color)

    setExtractedColors(sortedColors)
    addNotification(`Extracted ${sortedColors.length} colors from image`, 'success')
  }

  const addColorToPalette = (color) => {
    const currentColors = colorlyState.colors || []
    if (!currentColors.includes(color)) {
      updateTool('colorly', {
        colors: [...currentColors, color],
        selectedColor: color
      })
      addNotification('Color added to palette', 'success')
    }
  }

  const removeColorFromPalette = (color) => {
    const currentColors = colorlyState.colors || []
    const updatedColors = currentColors.filter(c => c !== color)
    updateTool('colorly', {
      colors: updatedColors,
      selectedColor: updatedColors.length > 0 ? updatedColors[0] : null
    })
    addNotification('Color removed from palette', 'info')
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      addNotification('Copied to clipboard!', 'success')
    } catch (error) {
      addNotification('Failed to copy to clipboard', 'error')
    }
  }

  const exportPalette = () => {
    const colors = colorlyState.colors || []
    if (colors.length === 0) {
      addNotification('No colors in palette to export', 'warning')
      return
    }

    const paletteData = {
      name: 'Colorly Palette',
      colors: colors.map(color => getColorFormats(color)),
      created: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(paletteData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'colorly-palette.json'
    a.click()
    URL.revokeObjectURL(url)

    addNotification('Palette exported successfully', 'success')
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <SwatchIcon className="w-8 h-8 mr-3 text-primary-600 dark:text-primary-400" />
          Colorly
        </h1>
        <p className="text-gray-600 dark:text-dark-400 mt-2">
          Extract colors from images and convert between color formats
        </p>
      </div>

      {/* Image Upload and Color Picker */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Image Upload */}
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Extract from Image</h3>

          <div className="space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 transition-colors"
            >
              <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-dark-400 mb-2">
                Click to upload an image
              </p>
              <p className="text-sm text-gray-500 dark:text-dark-500">
                PNG, JPG, GIF up to 10MB
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {colorlyState.imageData && (
              <div className="text-center">
                <img
                  src={colorlyState.imageData}
                  alt="Uploaded"
                  className="max-w-full h-32 object-contain mx-auto rounded-lg"
                />
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>

        {/* Color Picker */}
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Color Picker</h3>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <input
                type="color"
                value={colorInput}
                onChange={(e) => setColorInput(e.target.value)}
                className="w-16 h-16 rounded-lg border border-gray-300 dark:border-dark-600 cursor-pointer"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                  placeholder="#3B82F6"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white font-mono focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => addColorToPalette(colorInput)}
                className="flex items-center px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                Add
              </button>
            </div>

            {getColorFormats(colorInput) && (
              <div className="bg-gray-50 dark:bg-dark-900 rounded-lg p-3">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Color Formats</h4>
                <div className="space-y-1 text-sm font-mono">
                  {Object.entries(getColorFormats(colorInput)).map(([format, value]) => (
                    <div key={format} className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-dark-400 uppercase">{format}:</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-900 dark:text-white">{value}</span>
                        <button
                          onClick={() => copyToClipboard(value)}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <DocumentDuplicateIcon className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Extracted Colors */}
      {extractedColors.length > 0 && (
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Extracted Colors</h3>
          <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
            {extractedColors.map((color, index) => (
              <div key={index} className="group relative">
                <div
                  className="w-full h-16 rounded-lg border border-gray-200 dark:border-dark-600 cursor-pointer hover:scale-105 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => addColorToPalette(color)}
                  title={`Click to add ${color} to palette`}
                />
                <div className="absolute inset-x-0 bottom-0 bg-black bg-opacity-75 text-white text-xs text-center py-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  {color}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Color Palette */}
      <div className="flex-1 bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-dark-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Color Palette</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-dark-400">
              {(colorlyState.colors || []).length} colors
            </span>
            <button
              onClick={exportPalette}
              disabled={(colorlyState.colors || []).length === 0}
              className="flex items-center px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm"
            >
              <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
              Export
            </button>
          </div>
        </div>

        <div className="flex-1 p-4">
          {(colorlyState.colors || []).length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {(colorlyState.colors || []).map((color, index) => (
                <div key={index} className="group">
                  <div
                    className="w-full h-24 rounded-lg border border-gray-200 dark:border-dark-600 cursor-pointer hover:scale-105 transition-transform relative"
                    style={{ backgroundColor: color }}
                    onClick={() => updateTool('colorly', { selectedColor: color })}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeColorFromPalette(color)
                      }}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                  <div className="mt-2 text-center">
                    <div className="text-sm font-mono text-gray-900 dark:text-white">{color}</div>
                    <button
                      onClick={() => copyToClipboard(color)}
                      className="text-xs text-gray-500 dark:text-dark-400 hover:text-gray-700 dark:hover:text-dark-300"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <SwatchIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Colors in Palette</h3>
              <p className="text-gray-600 dark:text-dark-400 max-w-md mx-auto">
                Upload an image to extract colors or use the color picker to add colors manually.
              </p>
            </div>
          )}
        </div>

        {/* Selected Color Details */}
        {colorlyState.selectedColor && (
          <div className="border-t border-gray-200 dark:border-dark-700 p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Selected Color Details</h4>
            <div className="flex items-center space-x-4">
              <div
                className="w-16 h-16 rounded-lg border border-gray-200 dark:border-dark-600"
                style={{ backgroundColor: colorlyState.selectedColor }}
              />
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm font-mono">
                {getColorFormats(colorlyState.selectedColor) &&
                  Object.entries(getColorFormats(colorlyState.selectedColor)).map(([format, value]) => (
                    <div key={format} className="flex items-center justify-between bg-gray-50 dark:bg-dark-900 rounded px-2 py-1">
                      <span className="text-gray-600 dark:text-dark-400 uppercase">{format}:</span>
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-900 dark:text-white">{value}</span>
                        <button
                          onClick={() => copyToClipboard(value)}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <DocumentDuplicateIcon className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Colorly
