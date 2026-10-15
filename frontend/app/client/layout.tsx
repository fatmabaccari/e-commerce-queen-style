'use client';

import { ReactNode } from 'react';
import SmartNavigation from "../client/components/SmartNavigation";
import FooterContacts from "./components/footer/footer";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
     
      <main className="flex-grow">
           <SmartNavigation />
        {children}
              <FooterContacts />
      </main>
 
    </div>
  );
}