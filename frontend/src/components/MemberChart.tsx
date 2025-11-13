import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { YearCount } from '../services/api'; // 'import type' kullanıyoruz

interface MemberChartProps {
  data: YearCount[];
}

function MemberChart({ data }: MemberChartProps) {
  
  // Veriyi yıla göre (artan) sırala
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => parseInt(a.year) - parseInt(b.year));
  }, [data]);

  return (
    <ResponsiveContainer width="100%" height={150}>
      <BarChart 
        data={sortedData} 
        // GÜNCELLEME: Y ekseni gizlendiği için sol boşluğu sıfırladık
        margin={{ top: 5, right: 0, left: 0, bottom: 0 }} 
      >
        <XAxis 
          dataKey="year" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
        />
        
        {/* GÜNCELLEME: Y Eksenini gizle (sayıları kaldır) */}
        <YAxis 
          tick={false}      // Etiketleri (sayıları) gizler
          tickLine={false}  // Çizgileri gizler
          axisLine={false}  // Eksen çizgisini gizler
          width={0}         // Kapladığı alanı sıfırlar
        />
        
        <Tooltip
          cursor={{ fill: 'rgba(239, 246, 255, 0.7)' }} // blue-50
          contentStyle={{ 
            backgroundColor: 'white', 
            borderRadius: '0.5rem', 
            borderColor: '#ddd',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            fontSize: '12px',
            padding: '4px 8px'
          }}
          labelStyle={{ fontWeight: 'bold', color: '#1976d2' }}
        />
        <Bar 
          dataKey="count" 
          fill="#1976d2" // Mavi renk
          radius={[4, 4, 0, 0]} // Üst köşeleri yuvarlat
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default MemberChart;