"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Shield, Eye, Lock, Database, Users, Globe, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function PrivacyPolicyPage() {
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
              <Shield className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-gray-800 via-red-600 to-gray-800 bg-clip-text text-transparent mb-4">
              Privacy Policy
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Komitmen kami untuk melindungi privasi dan keamanan data Anda di platform 
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
          {/* Privacy Sections */}
          <div className="space-y-8">
            
            {/* Data Collection */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-red-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Pengumpulan Data</h2>
              </div>
              
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 leading-relaxed mb-4">
                  Kami mengumpulkan informasi yang Anda berikan secara langsung ketika mendaftar dan menggunakan platform ICA:
                </p>
                
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Informasi Pribadi:</strong> Nama lengkap, email, nomor telepon, tanggal lahir, jenis kelamin</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Informasi Profil:</strong> Foto profil, foto KTP, peran (atlet/pelatih), provinsi asal</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Data Aktivitas:</strong> Riwayat kompetisi, prestasi, aktivitas di platform</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Data Teknis:</strong> Alamat IP, browser, perangkat yang digunakan</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Data Usage */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-red-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Penggunaan Data</h2>
              </div>
              
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 leading-relaxed mb-4">
                  Data yang kami kumpulkan digunakan untuk tujuan-tujuan berikut:
                </p>
                
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Memverifikasi identitas dan keanggotaan dalam komunitas cheerleading</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Mengelola pendaftaran kompetisi dan acara cheerleading</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Memberikan informasi terkini tentang kompetisi dan berita cheerleading</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Menerbitkan kartu anggota (ID Card) digital</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Meningkatkan layanan dan pengalaman pengguna</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Data Protection */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-red-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Perlindungan Data</h2>
              </div>
              
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 leading-relaxed mb-4">
                  Kami menerapkan langkah-langkah keamanan yang ketat untuk melindungi data Anda:
                </p>
                
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Enkripsi Data:</strong> Semua data sensitif dienkripsi menggunakan standar industri</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Akses Terbatas:</strong> Hanya personel yang berwenang yang dapat mengakses data</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Backup Aman:</strong> Data di-backup secara teratur dengan enkripsi penuh</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Monitoring:</strong> Sistem keamanan dipantau 24/7 untuk deteksi ancaman</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Data Sharing */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-red-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Pembagian Data</h2>
              </div>
              
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 leading-relaxed mb-4">
                  Kami tidak menjual atau menyewakan data pribadi Anda kepada pihak ketiga. Data hanya dibagikan dalam kondisi berikut:
                </p>
                
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Dengan persetujuan eksplisit dari Anda</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Untuk keperluan penyelenggaraan kompetisi resmi</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Jika diwajibkan oleh hukum atau otoritas yang berwenang</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Dengan mitra tepercaya untuk operasional platform (dengan perjanjian kerahasiaan)</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* User Rights */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-red-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Hak Pengguna</h2>
              </div>
              
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 leading-relaxed mb-4">
                  Sebagai pengguna platform ICA, Anda memiliki hak-hak berikut:
                </p>
                
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Akses Data:</strong> Meminta salinan data pribadi yang kami simpan</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Koreksi Data:</strong> Memperbarui atau memperbaiki data yang tidak akurat</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Penghapusan Data:</strong> Meminta penghapusan data pribadi Anda</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Portabilitas Data:</strong> Mendapatkan data dalam format yang dapat dipindahkan</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Penarikan Persetujuan:</strong> Menarik persetujuan penggunaan data kapan saja</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-8 shadow-lg text-white">
              <h2 className="text-2xl font-bold mb-4">Hubungi Kami</h2>
              <p className="mb-4 opacity-90">
                Jika Anda memiliki pertanyaan tentang kebijakan privasi ini atau ingin menggunakan hak-hak Anda, 
                silakan hubungi kami:
              </p>
              
              <div className="space-y-2 opacity-90">
                <p><strong>Email:</strong> indonesiancheerassociation@gmail.com</p>
                <p><strong>Alamat:</strong> Indonesian Cheer Association, Jakarta, Indonesia</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
} 