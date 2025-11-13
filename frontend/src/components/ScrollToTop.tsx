import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Rota değiştiğinde (URL değiştiğinde) pencereyi otomatik olarak en üste kaydırır.
 */
function ScrollToTop() {
  const { pathname } = useLocation(); // useLocation tipini otomatik olarak çıkarır

  useEffect(() => {
    // Pencerenin kaydırma pozisyonunu (top) sıfıra ayarlar
    window.scrollTo(0, 0);
  }, [pathname]); // pathname değiştiğinde (yani sayfa değiştiğinde) çalışır

  // Bu bileşen görsel bir şey döndürmez, sadece yan etki (side effect) yaratır
  return null;
}

export default ScrollToTop;