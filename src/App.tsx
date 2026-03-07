import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Production } from './pages/Production';
import { Inventory } from './pages/Inventory';
import { Sales } from './pages/Sales';
import { Reports } from './pages/Reports';
import { Comercial } from './pages/Comercial';
import { Compras } from './pages/Compras';
import { Financeiro } from './pages/Financeiro';
import { Expedicao } from './pages/Expedicao';
import { Login } from './pages/Login';
import { Users } from './pages/Users';
import { Settings } from './pages/Settings';
import { DRE } from './pages/DRE';
import { AuditLogs } from './pages/AuditLogs';
import { useAppStore } from './store/useAppStore';

function App() {
  const { currentUser, initialize } = useAppStore();

  useEffect(() => {
    if (currentUser) {
      initialize();
    }
  }, [currentUser, initialize]);

  return (
    <BrowserRouter>
      {!currentUser ? (
        <Login />
      ) : (
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="comercial" element={<Comercial />} />
            <Route path="vendas" element={<Sales />} />
            <Route path="compras" element={<Compras />} />
            <Route path="estoque" element={<Inventory />} />
            <Route path="production" element={<Production />} />
            <Route path="expedicao" element={<Expedicao />} />
            <Route path="financeiro" element={<Financeiro />} />
            <Route path="controladoria" element={<Reports />} />
            <Route path="dre" element={<DRE />} />
            <Route path="usuarios" element={<Users />} />
            <Route path="configuracoes" element={<Settings />} />
            <Route path="auditoria" element={<AuditLogs />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      )}
    </BrowserRouter>
  );
}

export default App;
