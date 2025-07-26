'use client'

import { useState, useRef, useEffect } from 'react'
import { useToast } from "@/hooks/use-toast"
import { useAppSelector } from "@/lib/redux/hooks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, Settings, RefreshCw, Copy } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface IDCardData {
    memberID: string
    name: string
    birthDate: string
    gender: string
    province: string
    status: string
    registrationDate: string // Added registration date
    photo: string
}

interface StyleSettings {
    // Photo settings
    photoX: number
    photoY: number
    photoWidth: number
    photoHeight: number
    photoRadius: number // Added for rounded corners

    // Name settings
    nameX: number
    nameY: number
    nameFontSize: number
    nameColor: string

    // ID settings
    idLabelX: number
    idLabelY: number
    idValueX: number
    idValueY: number

    // Birth Date settings
    birthLabelX: number
    birthLabelY: number
    birthValueX: number
    birthValueY: number

    // Gender settings
    genderLabelX: number
    genderLabelY: number
    genderValueX: number
    genderValueY: number

    // Province settings
    provinceLabelX: number
    provinceLabelY: number
    provinceValueX: number
    provinceValueY: number

    // Status settings
    statusLabelX: number
    statusLabelY: number
    statusValueX: number
    statusValueY: number

    // Registration Date settings
    regDateLabelX: number
    regDateLabelY: number
    regDateValueX: number
    regDateValueY: number

    // Text styling
    labelFontSize: number
    valueFontSize: number
    labelColor: string
    valueColor: string
}

export default function IDCardEditor() {
    const { user, profile } = useAppSelector((state) => state.auth)
    const provinces = useAppSelector((state) => state.provinces.provinces)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [templateImage, setTemplateImage] = useState<HTMLImageElement | null>(null)
    const [righteousFont, setRighteousFont] = useState<FontFace | null>(null)
    const { toast } = useToast()

    const [idCardData, setIdCardData] = useState<IDCardData>({
        memberID: 'ICA12345',
        name: 'John Doe Member',
        birthDate: '1990-01-01',
        gender: 'Male',
        province: 'Jakarta',
        status: 'MEMBER',
        registrationDate: '2024-01-15', // Added registration date
        photo: '/placeholder-user.jpg'
    })

    const [styleSettings, setStyleSettings] = useState<StyleSettings>({
        // Photo settings
        photoX: 70,
        photoY: 200,
        photoWidth: 310,
        photoHeight: 325,
        photoRadius: 20, // Default rounded corner radius

        // Name settings
        nameX: 400,
        nameY: 320,
        nameFontSize: 50,
        nameColor: '#FFFFFF',

        // ID settings
        idLabelX: 400,
        idLabelY: 380,
        idValueX: 395,
        idValueY: 410,

        // Birth Date settings
        birthLabelX: 593,
        birthLabelY: 380,
        birthValueX: 590,
        birthValueY: 410,

        // Gender settings
        genderLabelX: 857,
        genderLabelY: 380,
        genderValueX: 860,
        genderValueY: 410,

        // Province settings
        provinceLabelX: 392,
        provinceLabelY: 450,
        provinceValueX: 395,
        provinceValueY: 490,

        // Status settings
        statusLabelX: 592,
        statusLabelY: 450,
        statusValueX: 595,
        statusValueY: 490,

        // Registration Date settings
        regDateLabelX: 392,
        regDateLabelY: 520,
        regDateValueX: 850,
        regDateValueY: 580,

        // Text styling
        labelFontSize: 18,
        valueFontSize: 18,
        labelColor: '#e52b29', // Changed to red
        valueColor: '#e52b29'  // Changed to red
    })

    // Load Righteous font
    useEffect(() => {
        const loadFont = async () => {
            try {
                const font = new FontFace('Righteous', 'url(/righteous-Regular.ttf)')
                await font.load()
                document.fonts.add(font)
                setRighteousFont(font)
            } catch (error) {
                console.error('Failed to load Righteous font:', error)
            }
        }
        loadFont()
    }, [])

    // Format date to Indonesian format (day - month name - year)
    const formatRegistrationDate = (dateString: string) => {
        if (!dateString) return ''
        
        const date = new Date(dateString)
        const monthNames = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ]
        
        const day = date.getDate()
        const month = monthNames[date.getMonth()]
        const year = date.getFullYear()
        
        return `${month}, ${day} ${year}`
    }

    // Format birth date to Indonesian format (month name - day - year)
    const formatBirthDate = (dateString: string) => {
        if (!dateString) return ''
        
        const date = new Date(dateString)
        const monthNames = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ]
        
        const day = date.getDate()
        const month = monthNames[date.getMonth()]
        const year = date.getFullYear()
        
        return `${month}, ${day} ${year}`
    }

    // Load user data if available
    useEffect(() => {
        if (profile && user) {
            const getProvinceName = (code: string) => {
                const province = provinces.find(p => p.id_province === code)
                return province ? province.name : code
            }

            setIdCardData({
                memberID: user.id.slice(0, 8).toUpperCase(),
                name: profile.display_name || 'Member Name',
                birthDate: profile.birth_date || '1990-01-01',
                gender: profile.gender || 'Male',
                province: getProvinceName(profile.province_code || ''),
                status: profile.role?.toUpperCase() || 'MEMBER',
                registrationDate: profile.created_at?.split('T')[0] || '2024-01-15', // Extract date from timestamp
                photo: profile.profile_photo_url || '/placeholder-user.jpg'
            })
        }
    }, [profile, user, provinces])

    // Load template image
    useEffect(() => {
        const img = new window.Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
            setTemplateImage(img)
        }
        img.onerror = () => {
            console.error('Failed to load template image')
        }
        img.src = '/id_card.jpg'
    }, [])

    // Auto-draw when settings or data change
    useEffect(() => {
        if (templateImage) {
            drawIDCard()
        }
    }, [styleSettings, idCardData, templateImage])

    const drawIDCard = async () => {
        if (!canvasRef.current || !templateImage) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Set canvas size
        canvas.width = 1012
        canvas.height = 638

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Draw template background
        ctx.drawImage(templateImage, 0, 0, canvas.width, canvas.height)

        // Draw member photo
        if (idCardData.photo) {
            try {
                const photoImg = new window.Image()
                photoImg.crossOrigin = 'anonymous'

                await new Promise((resolve, reject) => {
                    photoImg.onload = resolve
                    photoImg.onerror = reject

                    if (idCardData.photo.includes('http')) {
                        photoImg.src = idCardData.photo
                    } else if (idCardData.photo.startsWith('/')) {
                        photoImg.src = idCardData.photo
                    } else {
                        const imagePath = idCardData.photo.includes('/')
                            ? idCardData.photo
                            : `profile-photos/${idCardData.photo}`

                        const { data: urlData } = supabase.storage
                            .from("uploads")
                            .getPublicUrl(imagePath)

                        photoImg.src = urlData?.publicUrl || '/placeholder-user.jpg'
                    }
                })

                ctx.save()
                ctx.beginPath()
                // Create rounded rectangle path
                const radius = styleSettings.photoRadius // Use customizable radius
                const x = styleSettings.photoX
                const y = styleSettings.photoY
                const width = styleSettings.photoWidth
                const height = styleSettings.photoHeight

                ctx.moveTo(x + radius, y)
                ctx.lineTo(x + width - radius, y)
                ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
                ctx.lineTo(x + width, y + height - radius)
                ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
                ctx.lineTo(x + radius, y + height)
                ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
                ctx.lineTo(x, y + radius)
                ctx.quadraticCurveTo(x, y, x + radius, y)
                ctx.closePath()

                ctx.clip()
                ctx.drawImage(photoImg, styleSettings.photoX, styleSettings.photoY, styleSettings.photoWidth, styleSettings.photoHeight)
                ctx.restore()
            } catch (error) {
                console.error('Error loading photo:', error)
            }
        }

        // Set text alignment
        ctx.textAlign = 'left'

        // Draw Member Name
        const fontFamily = righteousFont ? 'Righteous, Arial' : 'Arial'
        ctx.font = `bold ${styleSettings.nameFontSize}px ${fontFamily}`
        ctx.fillStyle = styleSettings.nameColor
        ctx.fillText(idCardData.name.toUpperCase(), styleSettings.nameX, styleSettings.nameY)

        // Draw labels and values
        ctx.font = `bold ${styleSettings.labelFontSize}px ${fontFamily}`

        // Member ID
        ctx.fillStyle = styleSettings.labelColor
        // ctx.fillText('ID:', styleSettings.idLabelX, styleSettings.idLabelY)
        ctx.fillStyle = styleSettings.valueColor
        ctx.font = `bold ${styleSettings.valueFontSize}px ${fontFamily}`
        ctx.fillText(idCardData.memberID, styleSettings.idValueX, styleSettings.idValueY)

        // Birth Date
        ctx.font = `bold ${styleSettings.labelFontSize}px ${fontFamily}`
        ctx.fillStyle = styleSettings.labelColor
        // ctx.fillText('BIRTH OF DATE:', styleSettings.birthLabelX, styleSettings.birthLabelY)
        ctx.fillStyle = styleSettings.valueColor
        ctx.font = `bold ${styleSettings.valueFontSize}px ${fontFamily}`
        const formattedBirthDate = formatBirthDate(idCardData.birthDate)
        ctx.fillText(formattedBirthDate, styleSettings.birthValueX, styleSettings.birthValueY)

        // Gender
        ctx.font = `bold ${styleSettings.labelFontSize}px ${fontFamily}`
        ctx.fillStyle = styleSettings.labelColor
        // ctx.fillText('GENDER:', styleSettings.genderLabelX, styleSettings.genderLabelY)
        ctx.fillStyle = styleSettings.valueColor
        ctx.font = `bold ${styleSettings.valueFontSize}px ${fontFamily}`
        ctx.fillText(idCardData.gender, styleSettings.genderValueX, styleSettings.genderValueY)

        // Province
        ctx.font = `bold ${styleSettings.labelFontSize}px ${fontFamily}`
        ctx.fillStyle = styleSettings.labelColor
        // ctx.fillText('PROVINCE:', styleSettings.provinceLabelX, styleSettings.provinceLabelY)
        ctx.fillStyle = styleSettings.valueColor
        ctx.font = `bold ${styleSettings.valueFontSize}px ${fontFamily}`
        ctx.fillText(idCardData.province, styleSettings.provinceValueX, styleSettings.provinceValueY)

        // Status
        ctx.font = `bold ${styleSettings.labelFontSize}px ${fontFamily}`
        ctx.fillStyle = styleSettings.labelColor
        // ctx.fillText('STATUS:', styleSettings.statusLabelX, styleSettings.statusLabelY)
        ctx.fillStyle = styleSettings.valueColor
        ctx.font = `bold ${styleSettings.valueFontSize}px ${fontFamily}`
        ctx.fillText(idCardData.status, styleSettings.statusValueX, styleSettings.statusValueY)

        // Registration Date (BLACK color)
        ctx.font = `bold ${styleSettings.labelFontSize}px ${fontFamily}`
        ctx.fillStyle = '#000000' // Black for registration date
        ctx.font = `bold ${styleSettings.valueFontSize}px ${fontFamily}`
        const regDate = formatRegistrationDate(profile?.created_at || idCardData.registrationDate)
        ctx.fillText(regDate, styleSettings.regDateValueX, styleSettings.regDateValueY)
    }

    const downloadIDCard = () => {
        if (!canvasRef.current) return

        const link = document.createElement('a')
        link.download = `ICA-ID-Card-${idCardData.memberID}.png`
        link.href = canvasRef.current.toDataURL()
        link.click()
    }

    const resetToDefault = () => {
        setStyleSettings({
            photoX: 250,
            photoY: 245,
            photoWidth: 310,
            photoHeight: 325,
            photoRadius: 20, // Added for rounded corners
            nameX: 400,
            nameY: 320,
            nameFontSize: 32,
            nameColor: '#FFFFFF',
            idLabelX: 400,
            idLabelY: 380,
            idValueX: 860,
            idValueY: 490,
            birthLabelX: 593,
            birthLabelY: 380,
            birthValueX: 395,
            birthValueY: 490,
            genderLabelX: 857,
            genderLabelY: 380,
            genderValueX: 860,
            genderValueY: 410,
            provinceLabelX: 392,
            provinceLabelY: 450,
            provinceValueX: 395,
            provinceValueY: 490,
            statusLabelX: 592,
            statusLabelY: 450,
            statusValueX: 595,
            statusValueY: 490,
            regDateLabelX: 392,
            regDateLabelY: 520,
            regDateValueX: 850,
            regDateValueY: 580,
            labelFontSize: 18,
            valueFontSize: 18,
            labelColor: '#e52b29', // Red
            valueColor: '#e52b29'  // Red
        })
    }

    const copyCodeSettings = () => {
        const code = `
// Font loading (add this to your component)
const [righteousFont, setRighteousFont] = useState<FontFace | null>(null)

useEffect(() => {
    const loadFont = async () => {
        try {
            const font = new FontFace('Righteous', 'url(/righteous-Regular.ttf)')
            await font.load()
            document.fonts.add(font)
            setRighteousFont(font)
        } catch (error) {
            console.error('Failed to load Righteous font:', error)
        }
    }
    loadFont()
}, [])

// Date formatting function
const formatRegistrationDate = (dateString: string) => {
    if (!dateString) return ''
    
    const date = new Date(dateString)
    const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]
    
    const day = date.getDate()
    const month = monthNames[date.getMonth()]
    const year = date.getFullYear()
    
    return \`\${month}, \${day} \${year}\`
}

// Birth date formatting function (month name - day - year)
const formatBirthDate = (dateString: string) => {
    if (!dateString) return ''
    
    const date = new Date(dateString)
    const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]
    
    const day = date.getDate()
    const month = monthNames[date.getMonth()]
    const year = date.getFullYear()
    
    
    return \`\${month}, \${day} \${year}\`
}

// Photo settings
const photoX = ${styleSettings.photoX}
const photoY = ${styleSettings.photoY}
const photoWidth = ${styleSettings.photoWidth}
const photoHeight = ${styleSettings.photoHeight}
const photoRadius = ${styleSettings.photoRadius} // Rounded corners

// Font family (use Righteous if loaded, otherwise fallback to Arial)
const fontFamily = righteousFont ? 'Righteous, Arial' : 'Arial'

// Rounded photo drawing code:
ctx.save()
ctx.beginPath()
const radius = photoRadius
const x = photoX
const y = photoY
const width = photoWidth
const height = photoHeight

ctx.moveTo(x + radius, y)
ctx.lineTo(x + width - radius, y)
ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
ctx.lineTo(x + width, y + height - radius)
ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
ctx.lineTo(x + radius, y + height)
ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
ctx.lineTo(x, y + radius)
ctx.quadraticCurveTo(x, y, x + radius, y)
ctx.closePath()

ctx.clip()
ctx.drawImage(photoImg, photoX, photoY, photoWidth, photoHeight)
ctx.restore()

// Name settings
const nameX = ${styleSettings.nameX}
const nameY = ${styleSettings.nameY}
ctx.font = 'bold ${styleSettings.nameFontSize}px ' + fontFamily
ctx.fillStyle = '${styleSettings.nameColor}'

// Text positions and styling (RED colors except registration date)
ctx.font = 'bold ${styleSettings.labelFontSize}px ' + fontFamily // Labels
ctx.font = 'bold ${styleSettings.valueFontSize}px ' + fontFamily // Values
ctx.fillStyle = '#e52b29' // Red color for labels and values
ctx.fillStyle = '#e52b29' // Red color for values

// Member ID
ctx.fillText('ID:', ${styleSettings.idLabelX}, ${styleSettings.idLabelY})
ctx.fillText(idCardData.memberID, ${styleSettings.idValueX}, ${styleSettings.idValueY})

// Birth Date
ctx.fillText('BIRTH OF DATE:', ${styleSettings.birthLabelX}, ${styleSettings.birthLabelY})
const formattedBirthDate = formatBirthDate(idCardData.birthDate)
ctx.fillText(formattedBirthDate, ${styleSettings.birthValueX}, ${styleSettings.birthValueY})

// Gender
ctx.fillText('GENDER:', ${styleSettings.genderLabelX}, ${styleSettings.genderLabelY})
ctx.fillText(idCardData.gender, ${styleSettings.genderValueX}, ${styleSettings.genderValueY})

// Province
ctx.fillText('PROVINCE:', ${styleSettings.provinceLabelX}, ${styleSettings.provinceLabelY})
ctx.fillText(idCardData.province, ${styleSettings.provinceValueX}, ${styleSettings.provinceValueY})

// Status
ctx.fillText('STATUS:', ${styleSettings.statusLabelX}, ${styleSettings.statusLabelY})
ctx.fillText(idCardData.status, ${styleSettings.statusValueX}, ${styleSettings.statusValueY})

// Registration Date (BLACK color - different from others)
ctx.fillStyle = '#000000' // Black for registration date
const regDate = formatRegistrationDate(profile?.created_at || idCardData.registrationDate)
ctx.fillText(regDate, ${styleSettings.regDateValueX}, ${styleSettings.regDateValueY})
`
        navigator.clipboard.writeText(code)
        toast({
          title: "Code Copied!",
          description: "Code has been copied to clipboard successfully.",
          variant: "default",
        })
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Settings className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">ID Card Layout Editor</h1>
                                <p className="text-gray-600">Adjust positions and styling in real-time</p>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <Button onClick={resetToDefault} variant="outline">
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Reset
                            </Button>
                            <Button onClick={copyCodeSettings} variant="outline">
                                <Copy className="mr-2 h-4 w-4" />
                                Copy Code
                            </Button>
                            <Button onClick={downloadIDCard} className="bg-green-600 hover:bg-green-700">
                                <Download className="mr-2 h-4 w-4" />
                                Download
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Settings Panel */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Sample Data */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Sample Data</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Name</Label>
                                    <Input
                                        value={idCardData.name}
                                        onChange={(e) => setIdCardData(prev => ({ ...prev, name: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label>Member ID</Label>
                                    <Input
                                        value={idCardData.memberID}
                                        onChange={(e) => setIdCardData(prev => ({ ...prev, memberID: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label>Birth Date</Label>
                                    <Input
                                        value={idCardData.birthDate}
                                        onChange={(e) => setIdCardData(prev => ({ ...prev, birthDate: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label>Registration Date</Label>
                                    <Input
                                        type="date"
                                        value={idCardData.registrationDate}
                                        onChange={(e) => setIdCardData(prev => ({ ...prev, registrationDate: e.target.value }))}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Photo Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Photo Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>X Position</Label>
                                        <Input
                                            type="number"
                                            value={styleSettings.photoX}
                                            onChange={(e) => setStyleSettings(prev => ({ ...prev, photoX: Number(e.target.value) }))}
                                        />
                                    </div>
                                    <div>
                                        <Label>Y Position</Label>
                                        <Input
                                            type="number"
                                            value={styleSettings.photoY}
                                            onChange={(e) => setStyleSettings(prev => ({ ...prev, photoY: Number(e.target.value) }))}
                                        />
                                    </div>
                                    <div>
                                        <Label>Width</Label>
                                        <Input
                                            type="number"
                                            value={styleSettings.photoWidth}
                                            onChange={(e) => setStyleSettings(prev => ({ ...prev, photoWidth: Number(e.target.value) }))}
                                        />
                                    </div>
                                    <div>
                                        <Label>Height</Label>
                                        <Input
                                            type="number"
                                            value={styleSettings.photoHeight}
                                            onChange={(e) => setStyleSettings(prev => ({ ...prev, photoHeight: Number(e.target.value) }))}
                                        />
                                    </div>
                                    <div>
                                        <Label>Corner Radius</Label>
                                        <Input
                                            type="number"
                                            value={styleSettings.photoRadius}
                                            onChange={(e) => setStyleSettings(prev => ({ ...prev, photoRadius: Number(e.target.value) }))}
                                            min={0}
                                            max={50}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Name Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Name Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>X Position</Label>
                                        <Input
                                            type="number"
                                            value={styleSettings.nameX}
                                            onChange={(e) => setStyleSettings(prev => ({ ...prev, nameX: Number(e.target.value) }))}
                                        />
                                    </div>
                                    <div>
                                        <Label>Y Position</Label>
                                        <Input
                                            type="number"
                                            value={styleSettings.nameY}
                                            onChange={(e) => setStyleSettings(prev => ({ ...prev, nameY: Number(e.target.value) }))}
                                        />
                                    </div>
                                    <div>
                                        <Label>Font Size</Label>
                                        <Input
                                            type="number"
                                            value={styleSettings.nameFontSize}
                                            onChange={(e) => setStyleSettings(prev => ({ ...prev, nameFontSize: Number(e.target.value) }))}
                                        />
                                    </div>
                                    <div>
                                        <Label>Color</Label>
                                        <Input
                                            type="color"
                                            value={styleSettings.nameColor}
                                            onChange={(e) => setStyleSettings(prev => ({ ...prev, nameColor: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Text Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle>General Text Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Label Font Size</Label>
                                        <Input
                                            type="number"
                                            value={styleSettings.labelFontSize}
                                            onChange={(e) => setStyleSettings(prev => ({ ...prev, labelFontSize: Number(e.target.value) }))}
                                        />
                                    </div>
                                    <div>
                                        <Label>Value Font Size</Label>
                                        <Input
                                            type="number"
                                            value={styleSettings.valueFontSize}
                                            onChange={(e) => setStyleSettings(prev => ({ ...prev, valueFontSize: Number(e.target.value) }))}
                                        />
                                    </div>
                                    <div>
                                        <Label>Label Color</Label>
                                        <Input
                                            type="color"
                                            value={styleSettings.labelColor}
                                            onChange={(e) => setStyleSettings(prev => ({ ...prev, labelColor: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <Label>Value Color</Label>
                                        <Input
                                            type="color"
                                            value={styleSettings.valueColor}
                                            onChange={(e) => setStyleSettings(prev => ({ ...prev, valueColor: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Field Positions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Field Positions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* ID Field */}
                                <div>
                                    <Label className="text-sm font-medium text-gray-700 mb-2 block">ID Field</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <Label className="text-xs">Label X</Label>
                                            <Input
                                                type="number"
                                                value={styleSettings.idLabelX}
                                                onChange={(e) => setStyleSettings(prev => ({ ...prev, idLabelX: Number(e.target.value) }))}
                                                className="text-sm"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Label Y</Label>
                                            <Input
                                                type="number"
                                                value={styleSettings.idLabelY}
                                                onChange={(e) => setStyleSettings(prev => ({ ...prev, idLabelY: Number(e.target.value) }))}
                                                className="text-sm"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Value X</Label>
                                            <Input
                                                type="number"
                                                value={styleSettings.idValueX}
                                                onChange={(e) => setStyleSettings(prev => ({ ...prev, idValueX: Number(e.target.value) }))}
                                                className="text-sm"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Value Y</Label>
                                            <Input
                                                type="number"
                                                value={styleSettings.idValueY}
                                                onChange={(e) => setStyleSettings(prev => ({ ...prev, idValueY: Number(e.target.value) }))}
                                                className="text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Birth Date Field */}
                                <div>
                                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Birth Date Field</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <Label className="text-xs">Label X</Label>
                                            <Input
                                                type="number"
                                                value={styleSettings.birthLabelX}
                                                onChange={(e) => setStyleSettings(prev => ({ ...prev, birthLabelX: Number(e.target.value) }))}
                                                className="text-sm"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Label Y</Label>
                                            <Input
                                                type="number"
                                                value={styleSettings.birthLabelY}
                                                onChange={(e) => setStyleSettings(prev => ({ ...prev, birthLabelY: Number(e.target.value) }))}
                                                className="text-sm"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Value X</Label>
                                            <Input
                                                type="number"
                                                value={styleSettings.birthValueX}
                                                onChange={(e) => setStyleSettings(prev => ({ ...prev, birthValueX: Number(e.target.value) }))}
                                                className="text-sm"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Value Y</Label>
                                            <Input
                                                type="number"
                                                value={styleSettings.birthValueY}
                                                onChange={(e) => setStyleSettings(prev => ({ ...prev, birthValueY: Number(e.target.value) }))}
                                                className="text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Gender Field */}
                                <div>
                                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Gender Field</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <Label className="text-xs">Label X</Label>
                                            <Input
                                                type="number"
                                                value={styleSettings.genderLabelX}
                                                onChange={(e) => setStyleSettings(prev => ({ ...prev, genderLabelX: Number(e.target.value) }))}
                                                className="text-sm"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Label Y</Label>
                                            <Input
                                                type="number"
                                                value={styleSettings.genderLabelY}
                                                onChange={(e) => setStyleSettings(prev => ({ ...prev, genderLabelY: Number(e.target.value) }))}
                                                className="text-sm"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Value X</Label>
                                            <Input
                                                type="number"
                                                value={styleSettings.genderValueX}
                                                onChange={(e) => setStyleSettings(prev => ({ ...prev, genderValueX: Number(e.target.value) }))}
                                                className="text-sm"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Value Y</Label>
                                            <Input
                                                type="number"
                                                value={styleSettings.genderValueY}
                                                onChange={(e) => setStyleSettings(prev => ({ ...prev, genderValueY: Number(e.target.value) }))}
                                                className="text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Province Field */}
                                <div>
                                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Province Field</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <Label className="text-xs">Label X</Label>
                                            <Input
                                                type="number"
                                                value={styleSettings.provinceLabelX}
                                                onChange={(e) => setStyleSettings(prev => ({ ...prev, provinceLabelX: Number(e.target.value) }))}
                                                className="text-sm"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Label Y</Label>
                                            <Input
                                                type="number"
                                                value={styleSettings.provinceLabelY}
                                                onChange={(e) => setStyleSettings(prev => ({ ...prev, provinceLabelY: Number(e.target.value) }))}
                                                className="text-sm"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Value X</Label>
                                            <Input
                                                type="number"
                                                value={styleSettings.provinceValueX}
                                                onChange={(e) => setStyleSettings(prev => ({ ...prev, provinceValueX: Number(e.target.value) }))}
                                                className="text-sm"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Value Y</Label>
                                            <Input
                                                type="number"
                                                value={styleSettings.provinceValueY}
                                                onChange={(e) => setStyleSettings(prev => ({ ...prev, provinceValueY: Number(e.target.value) }))}
                                                className="text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Status Field */}
                                <div>
                                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Status Field</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <Label className="text-xs">Label X</Label>
                                            <Input
                                                type="number"
                                                value={styleSettings.statusLabelX}
                                                onChange={(e) => setStyleSettings(prev => ({ ...prev, statusLabelX: Number(e.target.value) }))}
                                                className="text-sm"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Label Y</Label>
                                            <Input
                                                type="number"
                                                value={styleSettings.statusLabelY}
                                                onChange={(e) => setStyleSettings(prev => ({ ...prev, statusLabelY: Number(e.target.value) }))}
                                                className="text-sm"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Value X</Label>
                                            <Input
                                                type="number"
                                                value={styleSettings.statusValueX}
                                                onChange={(e) => setStyleSettings(prev => ({ ...prev, statusValueX: Number(e.target.value) }))}
                                                className="text-sm"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Value Y</Label>
                                            <Input
                                                type="number"
                                                value={styleSettings.statusValueY}
                                                onChange={(e) => setStyleSettings(prev => ({ ...prev, statusValueY: Number(e.target.value) }))}
                                                className="text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Registration Date Field */}
                                <div>
                                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Registration Date Field</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <Label className="text-xs">Label X</Label>
                                            <Input
                                                type="number"
                                                value={styleSettings.regDateLabelX}
                                                onChange={(e) => setStyleSettings(prev => ({ ...prev, regDateLabelX: Number(e.target.value) }))}
                                                className="text-sm"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Label Y</Label>
                                            <Input
                                                type="number"
                                                value={styleSettings.regDateLabelY}
                                                onChange={(e) => setStyleSettings(prev => ({ ...prev, regDateLabelY: Number(e.target.value) }))}
                                                className="text-sm"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Value X</Label>
                                            <Input
                                                type="number"
                                                value={styleSettings.regDateValueX}
                                                onChange={(e) => setStyleSettings(prev => ({ ...prev, regDateValueX: Number(e.target.value) }))}
                                                className="text-sm"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Value Y</Label>
                                            <Input
                                                type="number"
                                                value={styleSettings.regDateValueY}
                                                onChange={(e) => setStyleSettings(prev => ({ ...prev, regDateValueY: Number(e.target.value) }))}
                                                className="text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Preview */}
                    <div className="lg:col-span-2">
                        <Card className="h-fit sticky top-8">
                            <CardHeader>
                                <CardTitle>Live Preview</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="relative">
                                    <canvas
                                        ref={canvasRef}
                                        className="w-full h-auto border border-gray-200 rounded-lg shadow-sm"
                                        style={{ maxWidth: '100%', height: 'auto' }}
                                    />
                                    {!templateImage && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                                            <div className="text-center">
                                                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                                <p className="text-gray-500">Loading template...</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
