import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer'; // YENİ İMPORT
import ScrollToTop from './components/ScrollToTop'; 
import HomePage from './pages/HomePage';
import MembersPage from './pages/MembersPage';
import MemberDetailPage from './pages/MemberDetailPage';


function App() {
  return (
    // min-h-screen ve flex flex-col yapısı, footer'ı sayfanın en altına itmek için kritiktir.
    <div className="flex flex-col min-h-screen w-full"> 
    <ScrollToTop />
      <Navbar /> 
      
      {/* main içeriği, Navbar ve Footer arasındaki alanı doldurur */}
      <main className="flex-1 w-full"> 
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/members/:id" element={<MemberDetailPage />} />
        </Routes>
      </main>
      
      <Footer /> {/* FOOTER ARTIK HER SAYFADA GÖZÜKECEK */}
    </div>
  );
}

export default App;