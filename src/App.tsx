import { useState } from "react";
import MainLayout from "./layouts/MainLayout";
import StudyCsrPage from "./pages/StudyCsrPage";
import { useAuth } from "./auth/AuthContext";
import LoginPage from "./pages/LoginPage";

function App() {
  const { isAuthenticated } = useAuth();
  const [selectedStudyId, setSelectedStudyId] = useState<number | null>(null);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <MainLayout
      selectedStudyId={selectedStudyId}
      onSelectStudy={setSelectedStudyId}
    >
      <StudyCsrPage selectedStudyId={selectedStudyId} />
    </MainLayout>
  );
}

export default App;
