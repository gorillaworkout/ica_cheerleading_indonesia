"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { FileText, Scale, UserCheck, AlertTriangle, Crown, Target, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function TermsConditionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-red-100">
      <Header />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-32 h-32 border-2 border-red-500 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-red-500 rounded-full animate-bounce"></div>
          <div className="absolute bottom-40 left-32 w-24 h-24 border border-red-400 rotate-45 animate-spin"></div>
          <div className="absolute bottom-20 right-10 w-20 h-20 border-2 border-red-600 rounded-lg animate-pulse"></div>
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div 
            className="w-full h-full" 
            style={{
              backgroundImage: `
                linear-gradient(rgba(239, 68, 68, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(239, 68, 68, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          ></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-16">
          {/* Back Button */}
          <Link 
            href="/" 
            className="inline-flex items-center space-x-2 text-red-600 hover:text-red-700 mb-8 group transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Kembali ke Beranda</span>
          </Link>

          {/* Hero Content */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full mb-6 shadow-lg">
              <FileText className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-gray-800 via-red-600 to-gray-800 bg-clip-text text-transparent mb-4">
              Terms & Conditions
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Syarat dan ketentuan penggunaan platform 
              <span className="font-semibold text-red-600"> Indonesian Cheer Association</span>
            </p>
            
            <div className="mt-8 text-sm text-gray-500">
              Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative z-10 container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Terms Sections */}
          <div className="space-y-8">
            
            {/* Acceptance */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-red-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Penerimaan Syarat</h2>
              </div>
              
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 leading-relaxed mb-4">
                  Dengan mengakses dan menggunakan platform Indonesian Cheer Association (ICA), Anda setuju untuk mematuhi 
                  dan terikat oleh syarat dan ketentuan berikut. Jika Anda tidak setuju dengan syarat-syarat ini, 
                  mohon untuk tidak menggunakan platform kami.
                </p>
                
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Platform ini khusus untuk komunitas cheerleading Indonesia</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Pengguna harus berusia minimal 13 tahun atau memiliki persetujuan orang tua</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Akun harus menggunakan identitas asli dan informasi yang valid</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* User Responsibilities */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-red-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Tanggung Jawab Pengguna</h2>
              </div>
              
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 leading-relaxed mb-4">
                  Sebagai anggota komunitas ICA, Anda bertanggung jawab untuk:
                </p>
                
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Informasi Akurat:</strong> Memberikan informasi yang benar dan terkini dalam profil Anda</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Keamanan Akun:</strong> Menjaga kerahasiaan password dan keamanan akun Anda</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Perilaku Sopan:</strong> Berkomunikasi dengan sopan dan menghormati anggota lain</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Konten Positif:</strong> Tidak mengunggah konten yang melanggar, menyinggung, atau merugikan</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Kepatuhan Aturan:</strong> Mematuhi semua aturan kompetisi dan standar ICA</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Platform Rules */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-red-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <Scale className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Aturan Platform</h2>
              </div>
              
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 leading-relaxed mb-4">
                  Untuk menjaga keharmonisan komunitas, kami menerapkan aturan berikut:
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">✅ Diperbolehkan:</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Berbagi tips dan teknik cheerleading</li>
                      <li>• Mendaftar kompetisi resmi</li>
                      <li>• Networking dengan sesama cheerleader</li>
                      <li>• Promosi acara cheerleading yang positif</li>
                      <li>• Berbagi prestasi dan pencapaian</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">❌ Dilarang:</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Spam atau promosi komersial berlebihan</li>
                      <li>• Konten yang menyinggung SARA</li>
                      <li>• Pelecehan atau bullying</li>
                      <li>• Pemalsuan identitas atau data</li>
                      <li>• Berbagi konten yang melanggar hukum</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Competition Rules */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-red-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Aturan Kompetisi</h2>
              </div>
              
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 leading-relaxed mb-4">
                  Peserta kompetisi yang diselenggarakan melalui platform ICA wajib mematuhi:
                </p>
                
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Pendaftaran:</strong> Mendaftar dengan data yang akurat dan lengkap</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Verifikasi:</strong> Memiliki status terverifikasi untuk mengikuti kompetisi resmi</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Fair Play:</strong> Bermain dengan sportif dan menjunjung tinggi fair play</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Keputusan Juri:</strong> Menghormati keputusan juri dan panitia kompetisi</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Sanksi:</strong> Menerima sanksi jika melanggar aturan kompetisi</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Intellectual Property */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-blue-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Hak Kekayaan Intelektual</h2>
              </div>
              
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 leading-relaxed mb-4">
                  Mengenai kepemilikan konten dan hak kekayaan intelektual:
                </p>
                
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Platform ICA:</strong> Logo, desain, dan teknologi platform adalah milik ICA</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Konten Pengguna:</strong> Anda memiliki hak atas konten yang Anda unggah</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Lisensi Penggunaan:</strong> Anda memberikan lisensi kepada ICA untuk menampilkan konten Anda</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Pelanggaran:</strong> Melaporkan pelanggaran hak cipta kepada admin</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Limitations */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-blue-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Batasan Tanggung Jawab</h2>
              </div>
              
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 leading-relaxed mb-4">
                  ICA tidak bertanggung jawab atas:
                </p>
                
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Kerugian akibat gangguan teknis atau downtime platform</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Konflik atau perselisihan antar pengguna</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Konten yang diunggah oleh pengguna lain</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Keputusan atau tindakan pihak ketiga</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Kehilangan data akibat kelalaian pengguna</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Changes to Terms */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-blue-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Perubahan Syarat dan Ketentuan</h2>
              
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 leading-relaxed">
                  ICA berhak mengubah syarat dan ketentuan ini sewaktu-waktu. Perubahan akan dinotifikasi melalui platform 
                  dan dianggap efektif setelah 30 hari sejak publikasi. Penggunaan berkelanjutan setelah perubahan 
                  dianggap sebagai persetujuan terhadap syarat yang baru.
                </p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 shadow-lg text-white">
              <h2 className="text-2xl font-bold mb-4">Kontak & Dukungan</h2>
              <p className="mb-4 opacity-90">
                Jika Anda memiliki pertanyaan tentang syarat dan ketentuan ini atau membutuhkan bantuan, 
                jangan ragu untuk menghubungi tim support kami:
              </p>
              
              <div className="space-y-2 opacity-90">
                <p><strong>Email Support:</strong> support@indonesiancheer.org</p>
                <p><strong>Email Legal:</strong> legal@indonesiancheer.org</p>
                <p><strong>Alamat:</strong> Indonesian Cheer Association, Jakarta, Indonesia</p>
                <p><strong>Telepon:</strong> +62-21-XXXX-XXXX</p>
              </div>
              
              <div className="mt-6 p-4 bg-white/10 rounded-lg">
                <p className="text-sm">
                  <strong>Jam Operasional Support:</strong><br/>
                  Senin - Jumat: 09:00 - 17:00 WIB<br/>
                  Sabtu: 09:00 - 15:00 WIB<br/>
                  Minggu: Tutup
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
} 