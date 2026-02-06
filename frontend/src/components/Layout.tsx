import { ReactNode } from 'react';
import NavBar from './NavBar';

interface Props {
  children: ReactNode;
}

export default function Layout({ children }: Props) {
  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      <NavBar />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {children}
      </main>
      <footer className="py-4 text-center text-xs text-surface-400 border-t border-surface-200">
        <span>MoniART</span>
      </footer>
    </div>
  );
}
