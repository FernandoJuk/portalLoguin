import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import UploadAdmin from './pages/UploadAdmin'; // novo
import AdminArquivos from './pages/AdminArquivos';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin/upload" element={<UploadAdmin />} /> {/* admin */}
        <Route path="/admin/arquivos" element={<AdminArquivos />} /> {/* admin */}
      </Routes>
    </Router>
  );
}

export default App;