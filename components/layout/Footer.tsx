// components/layout/Footer.tsx
import { APP_NAME, APP_VERSION } from "@/lib/constants";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-6 mt-auto border-t border-gray-800/50 bg-[#090a0e]/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
        
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-400">{APP_NAME}</span>
          <span className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full font-mono border border-gray-700">
            {APP_VERSION}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/terminos" className="hover:text-orange-500 transition-colors">
            Términos
          </Link>
          <Link href="/configuracion" className="hover:text-orange-500 transition-colors">
            Soporte
          </Link>
          <span>© {currentYear} Todos los derechos reservados.</span>
        </div>

      </div>
    </footer>
  );
}
