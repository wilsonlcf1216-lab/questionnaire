import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import ExportSummary from "@/pages/ExportSummary";
import Home from "@/pages/Home";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/export" element={<ExportSummary />} />
      </Routes>
    </Router>
  );
}
