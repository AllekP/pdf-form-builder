import React from 'react';
import PDFFormBuilder from './components/pdf/PDFFormBuilder';
import './index.css'; // Add this import if not already in main.jsx

function App() {
  return (
    <div className="min-h-screen">
      <PDFFormBuilder />
    </div>
  );
}

export default App;