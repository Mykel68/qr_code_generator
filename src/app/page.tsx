'use client'

import { useState, useRef, useCallback } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Share2, Download, AlertCircle, X, Copy, Mail, Upload, Palette } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function QRCodeGenerator() {
  const [inputText, setInputText] = useState('')
  const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [logo, setLogo] = useState<string | null>(null)
  const [logoSize, setLogoSize] = useState(50)
  const [logoX, setLogoX] = useState(50)
  const [logoY, setLogoY] = useState(50)
  const [fgColor, setFgColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#FFFFFF')
  const qrRef = useRef<SVGSVGElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleShare = async () => {
    if (navigator.share && qrRef.current) {
      try {
        const svgData = new XMLSerializer().serializeToString(qrRef.current)
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
        const svgUrl = URL.createObjectURL(svgBlob)

        await navigator.share({
          title: 'QR Code',
          text: 'Check out this QR code!',
          url: svgUrl,
        })
        setAlert({ type: 'success', message: 'QR code shared successfully!' })
      } catch (error) {
        console.error('Error sharing:', error)
        setAlert({ type: 'error', message: 'Failed to share QR code. Please try again.' })
      }
    } else {
      setAlert({ type: 'error', message: 'Web Share API is not supported in your browser.' })
    }
  }

  const handleDownload = () => {
    if (qrRef.current) {
      const svgData = new XMLSerializer().serializeToString(qrRef.current)
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
      const svgUrl = URL.createObjectURL(svgBlob)

      const downloadLink = document.createElement('a')
      downloadLink.href = svgUrl
      downloadLink.download = 'qrcode.svg'
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
      setAlert({ type: 'success', message: 'QR code downloaded successfully!' })
    }
  }

  const handleCopyToClipboard = async () => {
    if (qrRef.current) {
      try {
        const svgData = new XMLSerializer().serializeToString(qrRef.current)
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
        const item = new ClipboardItem({ 'image/svg+xml': svgBlob })
        await navigator.clipboard.write([item])
        setAlert({ type: 'success', message: 'QR code copied to clipboard!' })
      } catch (error) {
        console.error('Error copying to clipboard:', error)
        setAlert({ type: 'error', message: 'Failed to copy QR code. Please try again.' })
      }
    }
  }

  const handleEmailShare = () => {
    if (inputText) {
      const subject = encodeURIComponent('Check out this QR code')
      const body = encodeURIComponent(`I've generated a QR code for: ${inputText}`)
      window.location.href = `mailto:?subject=${subject}&body=${body}`
      setAlert({ type: 'success', message: 'Email client opened with QR code information!' })
    }
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogo(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const logoImage = useCallback(() => {
    return {
      src: logo || '',
      height: logoSize,
      width: logoSize,
      excavate: true,
      x: logoX * 2 - logoSize,
      y: logoY * 2 - logoSize,
    }
  }, [logo, logoSize, logoX, logoY])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-lg">
          <CardTitle className="text-3xl font-bold text-center">QR Code Generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="space-y-2">
            <Label htmlFor="qr-input" className="text-lg font-semibold">Enter Text or URL</Label>
            <Input
              id="qr-input"
              type="text"
              placeholder="Enter text or URL"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full text-lg"
            />
          </div>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 flex justify-center bg-white p-6 rounded-lg shadow-inner">
              {inputText ? (
                <QRCodeSVG
                  value={inputText}
                  size={200}
                  level="H"
                  includeMargin={true}
                  imageSettings={logo ? logoImage() : undefined}
                  fgColor={fgColor}
                  bgColor={bgColor}
                  ref={qrRef}
                />
              ) : (
                <div className="w-[200px] h-[200px] flex items-center justify-center text-gray-400 text-lg">
                  QR Code will appear here
                </div>
              )}
            </div>
            <div className="flex-1">
              <Tabs defaultValue="logo" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="logo">Logo</TabsTrigger>
                  <TabsTrigger value="color">Color</TabsTrigger>
                </TabsList>
                <TabsContent value="logo" className="space-y-4">
                  <div>
                    <Label htmlFor="logo-upload" className="text-lg font-semibold">Upload Logo</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        ref={fileInputRef}
                      />
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Choose File
                      </Button>
                    </div>
                  </div>
                  {logo && (
                    <>
                      <div>
                        <Label htmlFor="logo-size" className="text-sm font-medium">Logo Size</Label>
                        <Slider
                          id="logo-size"
                          min={10}
                          max={100}
                          step={1}
                          value={[logoSize]}
                          onValueChange={(value) => setLogoSize(value[0])}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="logo-x" className="text-sm font-medium">Logo X Position</Label>
                        <Slider
                          id="logo-x"
                          min={0}
                          max={100}
                          step={1}
                          value={[logoX]}
                          onValueChange={(value) => setLogoX(value[0])}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="logo-y" className="text-sm font-medium">Logo Y Position</Label>
                        <Slider
                          id="logo-y"
                          min={0}
                          max={100}
                          step={1}
                          value={[logoY]}
                          onValueChange={(value) => setLogoY(value[0])}
                          className="mt-2"
                        />
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setLogo(null)}
                        className="w-full"
                      >
                        Remove Logo
                      </Button>
                    </>
                  )}
                </TabsContent>
                <TabsContent value="color" className="space-y-4">
                  <div>
                    <Label htmlFor="fg-color" className="text-lg font-semibold">Foreground Color</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        id="fg-color"
                        type="color"
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        className="w-12 h-12 p-1 rounded-md"
                      />
                      <Input
                        type="text"
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        className="flex-grow"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="bg-color" className="text-lg font-semibold">Background Color</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        id="bg-color"
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-12 h-12 p-1 rounded-md"
                      />
                      <Input
                        type="text"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="flex-grow"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          {alert && (
            <Alert variant={alert.type === 'success' ? 'default' : 'destructive'}>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{alert.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2"
                onClick={() => setAlert(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-between bg-gray-50 rounded-b-lg p-6">
          <Button
            onClick={() => {
              setInputText('')
              setLogo(null)
              setFgColor('#000000')
              setBgColor('#FFFFFF')
            }}
            variant="outline"
            className="w-full md:w-auto"
          >
            Clear All
          </Button>
          <div className="space-x-2 flex">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button disabled={!inputText} className="w-full md:w-auto">
                  <Share2 className="w-4 h-4 mr-2" />
                  <span className='hidden md:inline'>Share</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share (Native)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyToClipboard}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy to Clipboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEmailShare}>
                  <Mail className="w-4 h-4 mr-2" />
                  Share via Email
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={handleDownload} disabled={!inputText} className="w-full md:w-auto">
              <Download className="w-4 h-4 mr-2" />
              <span className='hidden md:inline'>Download</span>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}