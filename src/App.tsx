import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import StudyCsrPage from "./pages/StudyCsrPage";
import { useAuth } from "./auth/AuthContext";
import LoginPage from "./pages/LoginPage";

function App() {
  const { isAuthenticated } = useAuth();
  const [selectedStudyId, setSelectedStudyId] = useState<number | null>(null);

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route
        path="/"
        element={
          <MainLayout
            selectedStudyId={selectedStudyId}
            onSelectStudy={setSelectedStudyId}
          >
            <StudyCsrPage selectedStudyId={selectedStudyId} />
          </MainLayout>
        }
      />
      <Route
        path="/*"
        element={
          <MainLayout
            selectedStudyId={selectedStudyId}
            onSelectStudy={setSelectedStudyId}
          >
            <StudyCsrPage selectedStudyId={selectedStudyId} />
          </MainLayout>
        }
      />
    </Routes>
  );
}

export default App;
