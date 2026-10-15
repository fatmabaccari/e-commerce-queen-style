'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  ShoppingCart, 
  Tag, 
  TrendingUp,
  Users,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { isAuthenticated, signOut } from '@/lib/auth';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Produits', href: '/dashboard/products', icon: Package },
  { name: 'Catégories', href: '/dashboard/categories', icon: FolderTree },
  { name: 'Commandes', href: '/dashboard/orders', icon: ShoppingCart },
  { name: 'Utilisateurs', href: '/dashboard/users', icon: Users },
  { name: 'Remises', href: '/dashboard/discounts', icon: Tag },
  { name: 'Mouvements de stock', href: '/dashboard/stock-movements', icon: TrendingUp },
   { name: 'Interface Client', href: '/dashboard/interface', icon: LayoutDashboard },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  const handleSignOut = async () => {
    await signOut();
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}


      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-black shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">

          <div className="flex items-center justify-center py-8 px-6 border-b border-gray-800 relative">
            <div className="flex items-center justify-center w-full">
              <Image
                src="/logo.jpg"
                alt="Queen Style Logo"
                width={180}
                height={75}
                className="object-contain"
                priority
              />
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden absolute right-4 text-white hover:text-yellow-400"
            >
              <X className="w-6 h-6" />
            </button>
          </div>


          <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-yellow-400 text-black font-medium'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-yellow-400'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-black' : 'text-gray-300'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

     
          <div className="px-4 py-4 border-t border-gray-800">
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-3 text-gray-300 rounded-lg hover:bg-gray-800 hover:text-yellow-400 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
    
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex-1" />
            <div className="text-sm text-gray-600">
              Tableau de bord administrateur
            </div>
          </div>
        </header>

      
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}