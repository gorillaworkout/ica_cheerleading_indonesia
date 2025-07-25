import Link from "next/link"
import  Image  from 'next/image'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Image src="/ica-rounded.png" alt="ICA Logo" width={200} height={200}/>
              {/* <span className="font-bold text-xl">ICA</span> */}
            </div>
            <p className="text-gray-400 text-sm">
              Indonesian Cheer Association - Promoting excellence in cheerleading worldwide.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white">
                  About
                </Link>
              </li>
              <li>
                <Link href="/championships" className="text-gray-400 hover:text-white">
                  Championships
                </Link>
              </li>
              <li>
                <Link href="/education" className="text-gray-400 hover:text-white">
                  Education
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <p className="text-gray-400 text-sm">
              Email: indonesiancheerassociation@gmail.com
              <br />
              {/* Phone: +1 (555) 123-456 */}
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Indonesian Cheer Association. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
