'use client'

import Link from "next/link"
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 text-white overflow-hidden">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-30" 
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(239, 68, 68, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)`
        }}
      ></div>
      
      {/* Glowing top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-400 to-transparent opacity-60"></div>
      
      <div className="relative container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Logo Section */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-red-400 to-white rounded-full opacity-75 group-hover:opacity-100 blur transition duration-300"></div>
                <div className="relative">
                  <Image 
                    src="/ica-rounded.webp" 
                    alt="ICA Logo" 
                    width={60} 
                    height={60}
                    className="rounded-full"
                  />
                </div>
              </div>
              <div>
                <h2 className="font-bold text-2xl bg-gradient-to-r from-red-400 to-white bg-clip-text text-transparent">
                  ICA
                </h2>
                <p className="text-xs text-gray-300">Cheerleading Indonesia</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Indonesian Cheer Association - Membangun keunggulan dalam olahraga cheerleading di seluruh Indonesia dengan inovasi dan teknologi masa depan.
            </p>
            
            {/* Social Media Icons */}
            <div className="flex space-x-4 mt-6">
              {/* Facebook */}
              <div 
                onClick={() => window.open("https://www.facebook.com/cheerleadingindonesia", "_blank")}
                className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center hover:scale-110 transition-transform duration-300 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              
              {/* Instagram */}
              <div 
                onClick={() => window.open("https://www.instagram.com/cheerleadingindonesia/", "_blank")}
                className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center hover:scale-110 transition-transform duration-300 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </div>
              
              {/* YouTube */}
              <div 
                onClick={() => window.open("https://www.youtube.com/@Cheerleadingindonesia", "_blank")}
                className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-700 rounded-lg flex items-center justify-center hover:scale-110 transition-transform duration-300 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold mb-6 text-lg bg-gradient-to-r from-red-400 to-white bg-clip-text text-transparent">
              Quick Links
            </h3>
            <ul className="space-y-4">
              <li>
                <Link href="/about" className="group flex items-center text-gray-300 hover:text-red-400 transition-colors duration-300">
                  <span className="w-2 h-2 bg-red-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/championships" className="group flex items-center text-gray-300 hover:text-red-400 transition-colors duration-300">
                  <span className="w-2 h-2 bg-red-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  Championships
                </Link>
              </li>
              <li>
                <Link href="/news" className="group flex items-center text-gray-300 hover:text-red-400 transition-colors duration-300">
                  <span className="w-2 h-2 bg-red-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  News & Updates
                </Link>
              </li>
              <li>
                <Link href="/age-grid" className="group flex items-center text-gray-300 hover:text-red-400 transition-colors duration-300">
                  <span className="w-2 h-2 bg-red-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  Age Grid
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold mb-6 text-lg bg-gradient-to-r from-red-400 to-white bg-clip-text text-transparent">
              Legal
            </h3>
            <ul className="space-y-4">
              <li>
                <Link href="/privacy" className="group flex items-center text-gray-300 hover:text-red-400 transition-colors duration-300">
                  <span className="w-2 h-2 bg-white rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="group flex items-center text-gray-300 hover:text-red-400 transition-colors duration-300">
                  <span className="w-2 h-2 bg-white rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold mb-6 text-lg bg-gradient-to-r from-red-400 to-white bg-clip-text text-transparent">
              Contact
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-white rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <a href="mailto:indonesiancheerassociation@gmail.com" className="text-sm text-gray-300 hover:text-red-400 transition-colors duration-300">
                    indonesiancheerassociation@gmail.com
                  </a>
                </div>
              </div>
              
              {/* Newsletter Signup */}
              <div className="mt-6">
                <p className="text-sm text-gray-300 mb-3">Stay updated with our latest news</p>
                <div className="flex">
                  <label htmlFor="newsletter-email" className="sr-only">Enter your email for newsletter</label>
                  <input 
                    id="newsletter-email"
                    type="email" 
                    placeholder="Enter your email"
                    aria-label="Enter your email address for newsletter subscription"
                    className="flex-1 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-l-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-red-400 transition-colors duration-300"
                  />
                  <button 
                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 rounded-r-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105"
                    aria-label="Subscribe to newsletter"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="relative mt-16 pt-8">
          {/* Glowing divider */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-400 to-transparent opacity-60"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-400">
                &copy; {new Date().getFullYear()} Indonesian Cheer Association. All rights reserved.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Powered by innovation and passion for cheerleading excellence
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-400">System Online</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating elements for futuristic effect */}
      <div className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-r from-red-400/10 to-white/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-10 left-10 w-16 h-16 bg-gradient-to-r from-white/10 to-red-400/10 rounded-full blur-xl animate-pulse delay-1000"></div>
    </footer>
  )
}
