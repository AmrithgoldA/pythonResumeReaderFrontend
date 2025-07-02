import { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [details, setDetails] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [isEntering, setIsEntering] = useState(true);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsEntering(false), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if ((extractedText || details || suggestions) && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [extractedText, details, suggestions]);

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
    setDetails(null);
    setSuggestions(null);
    setUploadProgress(0);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/upload`, formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      const { extracted_text, data, resume_suggestions } = res.data;
      setExtractedText(extracted_text || "No text could be extracted from the document.");
      setDetails(data || {});
      setSuggestions(resume_suggestions || {});
    } catch (err) {
      const error = err.response?.data?.error || err.message;
      setDetails({
        Error: error,
        Note: "Please make sure:\n1. The file is not password protected\n2. The file is in PDF or DOCX format\n3. The file contains readable text (not scanned images)"
      });
    } finally {
      setLoading(false);
      setUploadProgress(0);
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

  const renderValue = (value) => {
    if (Array.isArray(value)) {
      return (
        <ul>
          {value.map((item, i) => (
            <li key={i}>{typeof item === 'object' ? renderObject(item) : item}</li>
          ))}
        </ul>
      );
    }
    if (typeof value === 'object' && value !== null) {
      return renderObject(value);
    }
    return value;
  };

  const renderObject = (obj) => {
    return (
      <ul>
        {Object.entries(obj).map(([key, val], i) => (
          <li key={i}>
            <strong>{key}:</strong> {renderValue(val)}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="container">
      <div className={`header ${isEntering ? 'slide-down' : ''}`}>
        <h1>Resume Parser</h1>
        <p className="subtitle">Upload your resume to extract text and structured information</p>
      </div>

      <div className={`card upload-card ${isEntering ? 'fade-in' : ''} ${file ? 'has-file' : ''}`}>
        <div className="upload-content">
          <h2>Upload Resume</h2>
          <div
            className={`upload-area ${file ? 'active pulse' : ''}`}
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
              <div className="file-text">{file ? file.name : 'Drag & drop or click to browse'}</div>
              {file && <div className="file-size">{(file.size / 1024).toFixed(2)} KB</div>}
              {loading && (
                <div className="upload-progress">
                  <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
                  <div className="progress-text">
                    {uploadProgress < 100 ? `Uploading... ${uploadProgress}%` : 'Processing...'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleUpload}
          disabled={loading || !file}
          className={`action-button ${loading ? 'loading' : ''}`}
        >
          {loading ? (
            <>
              <span className="spinner"></span> Processing...
            </>
          ) : (
            'Extract Information'
          )}
        </button>
      </div>

      {(extractedText || details || suggestions) && (
        <div className="results-container" ref={resultsRef}>
          <h2 className="results-title slide-in">Results</h2>
          <div className="results-grid">
            {extractedText && (
              <div className="card results-card slide-in">
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
              <div className="card results-card slide-in">
                <div className="output-section">
                  <div className="output-title">
                    <span>🔍</span>
                    <h3>Structured Data</h3>
                  </div>
                  <div className="output-content">
                    <ul className="output">
                      {Object.entries(details).map(([key, value], idx) => (
                        <li key={idx}>
                          <strong>{key}:</strong> {renderValue(value)}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {suggestions && (
            <div className="card-2 results-card slide-in">
              <div className="output-section">
                <div className="output-title">
                  <span>💡</span>
                  <h3>Improvement Suggestions</h3>
                </div>
                <div className="output-content">
                  {suggestions.summary && (
                    <div className="suggestion-summary">
                      <strong>Summary:</strong>
                      <p>{suggestions.summary}</p>
                    </div>
                  )}
                  {Array.isArray(suggestions.suggestions) && (
                    <div className="suggestion-grid">
                      <div className="left-column">
                        <h4>📂 Current Content</h4>
                        <ul>
                          {suggestions.suggestions.map((s, i) => (
                            <li
                              key={i}
                              className={selectedSuggestionIndex === i ? 'active' : ''}
                              onClick={() => setSelectedSuggestionIndex(i)}
                            >
                              <strong>{s.section}</strong>
                              <p>{s.currentContent || "Content not available"}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="right-column">
                        <h4>🛠️ Suggested Improvements</h4>
                        {suggestions.suggestions.length > 0 && (
                          <ul>
                            <li>
                              <p><strong>Issue:</strong> {suggestions.suggestions[selectedSuggestionIndex].issue}</p>
                              <p><strong>Recommendation:</strong> {suggestions.suggestions[selectedSuggestionIndex].recommendation}</p>
                              {suggestions.suggestions[selectedSuggestionIndex].suggestedContent && (
                                <div className="suggested-content">
                                  <strong>Suggested Content:</strong>
                                  <p>{suggestions.suggestions[selectedSuggestionIndex].suggestedContent}</p>
                                </div>
                              )}
                            </li>
                          </ul>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;