import './App.css';
import Header from './components/Header';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <div className="app-container">
          <Header />
          {children}
        </div>
      </body>
    </html>
  );
}
