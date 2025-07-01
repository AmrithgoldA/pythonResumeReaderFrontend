import { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [details, setDetails] = useState("");
  const [isEntering, setIsEntering] = useState(true);
  const fileInputRef = useRef(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsEntering(false), 400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if ((extractedText || details) && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [extractedText, details]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setExtractedText("");
    setDetails("");

    try {
      const res = await axios.post("https://pythonresumereaderbackend.onrender.com/upload", formData);
      const { extracted_text, data } = res.data;
      setExtractedText(extracted_text || "No text could be extracted from the document.");
      setDetails(data || "No structured details could be extracted.");
    } catch (err) {
      const error = err.response?.data?.error || err.message;
      setDetails(`Error: ${error}\n\nPlease make sure:\n1. The file is not password protected\n2. The file is in PDF or DOCX format\n3. The file contains readable text (not scanned images)`);
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Resume Parser</h1>
        <p className="subtitle">
          Upload your resume to extract text and structured information
        </p>
      </div>

      <div className={`card upload-card ${isEntering ? 'entering' : ''}`}>
        <div className="upload-content">
          <h2>Upload Resume</h2>
          <div
            className={`upload-area ${file ? 'active' : ''}`}
            onClick={() => fileInputRef.current.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileChange}
              className="file-input"
            />
            <div className="file-label">
              <div className="file-icon">📄</div>
              <div className="file-text">
                {file ? file.name : 'Drag & drop or click to browse'}
              </div>
            </div>
          </div>
        </div>

        <button onClick={handleUpload} disabled={loading || !file} className="action-button">
          {loading ? (
            <>
              <span className="spinner"></span> Processing...
            </>
          ) : (
            'Extract Information'
          )}
        </button>
      </div>

      {(extractedText || details) && (
        <div className="results-container" ref={resultsRef}>
          <h2 className="results-title">Results</h2>
          <div className="results-grid">
            {extractedText && (
              <div className="card results-card">
                <div className="output-section">
                  <div className="output-title">
                    <span>📝</span>
                    <h3>Extracted Text</h3>
                  </div>
                  <div className="output-content">
                    <pre className="output">{extractedText}</pre>
                  </div>
                </div>
              </div>
            )}

            {details && (
              <div className="card results-card">
                <div className="output-section">
                  <div className="output-title">
                    <span>🔍</span>
                    <h3>Structured Data</h3>
                  </div>
                  <div className="output-content">
                    <pre className="output">{details}</pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;