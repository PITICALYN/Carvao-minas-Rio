import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Suppliers } from './pages/Suppliers';
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
import { AuditLogs } from './pages/AuditLogs';
import { useAppStore } from './store/useAppStore';

function App() {
  const { currentUser } = useAppStore();

  if (!currentUser) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="comercial" element={<Comercial />} />
          <Route path="vendas" element={<Sales />} />
          <Route path="compras" element={<Compras />} />
          <Route path="estoque" element={<Inventory />} />
          <Route path="production" element={<Production />} />
          <Route path="expedicao" element={<Expedicao />} />
          <Route path="financeiro" element={<Financeiro />} />
          <Route path="controladoria" element={<Reports />} />
          <Route path="usuarios" element={<Users />} />
          <Route path="auditoria" element={<AuditLogs />} />

          {/* Legacy Routes Redirects or Keep for now */}
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="sales" element={<Sales />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
