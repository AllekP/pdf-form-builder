import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import {
  Type,
  Check,
  Calendar,
  ListFilter,
  Hash,
  Radio,
  Upload
} from 'lucide-react';
import FormField from './FormField';
import PropertiesPanel from './PropertiesPanel';

// Import PDF.js correctly
import * as PDFJS from 'pdfjs-dist';
console.log("🚀 ~ PDFJS:", PDFJS.version)

// Set worker using CDN
PDFJS.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS.version}/pdf.worker.min.js`;
// PDFJS.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${PDFJS.version}/build/pdf.worker.min.mjs`;


const PDFFormBuilder = () => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const canvasRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(null);
  const [renderError, setRenderError] = useState(null);
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null);

  // Inside PDFFormBuilder component, update the addField function:
  const addField = (type) => {
    const newField = {
      id: Date.now(),
      type,
      x: 100,
      y: 100,
      value: '',
      label: `New ${type} field`,
      page: currentPage,
      // Default dimensions based on type
      ...getDefaultDimensions(type),
      // Add specific properties based on field type
      ...getFieldTypeProperties(type)
    };
    setFields([...fields, newField]);
    setSelectedField(newField);
  };

  // Add these helper functions
  const getDefaultDimensions = (type) => {
    switch (type) {
      case 'checkbox':
        return { width: 20, height: 20 };
      case 'radio':
        return { width: 20, height: 20 };
        case 'date':
          return {
            value: '', // Default to empty string
            minDate: '', // Optional: set a minimum date
            maxDate: '', // Optional: set a maximum date
            placeholder: 'Select date'
          };
      case 'number':
        return { width: 150, height: 20 };
      case 'textarea':
        return { width: 250, height: 100 };
      default:
        return { width: 200, height: 20 }; // default text field size
    }
  };

  const getFieldTypeProperties = (type) => {
    switch (type) {
      case 'date':
        return {
          format: 'YYYY-MM-DD',
          placeholder: 'Select date'
        };
      case 'number':
        return {
          min: 0,
          max: 100,
          step: 1,
          placeholder: 'Enter number'
        };
      case 'radio':
        return {
          options: ['Option 1', 'Option 2', 'Option 3'],
          selectedOption: null
        };
      default:
        return {};
    }
  };

  // In PDFFormBuilder.jsx
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const calculatePosition = (clientX, clientY) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Calculate position relative to canvas and adjust for scale
    return {
      x: (clientX + scrollLeft - rect.left) / scale,
      y: (clientY + scrollTop - rect.top) / scale
    };
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const { x, y } = calculatePosition(e.clientX, e.clientY);

    try {
      const fieldData = e.dataTransfer.getData('field');
      if (fieldData) {
        const field = JSON.parse(fieldData);

        // Update position considering scale and offset
        setFields(fields.map(f =>
          f.id === field.id
            ? {
              ...f,
              x: (x - dragOffset.x / scale),  // Adjust offset for scale
              y: (y - dragOffset.y / scale)   // Adjust offset for scale
            }
            : f
        ));
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  };

  const handleDragStart = (field, offsetX, offsetY) => {
    // Store offset adjusted for current scale
    setDragOffset({
      x: offsetX * scale,
      y: offsetY * scale
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Update field
  const updateField = (updatedField) => {
    setFields(fields.map(field =>
      field.id === updatedField.id ? updatedField : field
    ));
    setSelectedField(updatedField);
  };

  // Delete field
  const deleteField = (fieldId) => {
    setFields(fields.filter(field => field.id !== fieldId));
    setSelectedField(null);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      try {
        console.log('Loading PDF file:', file.name);
        const fileUrl = URL.createObjectURL(file);
        setPdfUrl(fileUrl);

        // Load the PDF using PDF.js
        const loadingTask = PDFJS.getDocument(fileUrl);
        console.log('PDF loading task created');

        const pdfDocument = await loadingTask.promise;
        console.log('PDF loaded successfully, pages:', pdfDocument.numPages);

        setPdfDoc(pdfDocument);
        setNumPages(pdfDocument.numPages);
        setCurrentPage(1);
        setRenderError(null);
      } catch (error) {
        console.error('Error loading PDF:', error);
        setRenderError(`Error loading PDF: ${error.message}`);
      }
    }
  };

  const renderPage = async () => {
    if (pdfDoc && canvasRef.current) {
      try {
        console.log(`Rendering page ${currentPage}`);
        const page = await pdfDoc.getPage(currentPage);
        console.log('Page loaded');

        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        // Set display size (css pixels)
        const pixelRatio = window.devicePixelRatio || 1;
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        // Set actual size in memory (scaled to account for extra pixel density)
        canvas.width = viewport.width * pixelRatio;
        canvas.height = viewport.height * pixelRatio;

        // Scale context to match actual device pixels
        context.scale(pixelRatio, pixelRatio);

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        console.log('Starting page render');
        await page.render(renderContext).promise;
        console.log('Page rendered successfully');
        setRenderError(null);
      } catch (error) {
        console.error('Error rendering page:', error);
        setRenderError(`Error rendering page: ${error.message}`);
      }
    }
  };

  useEffect(() => {
    console.log('Render effect triggered', { pdfDoc, currentPage, scale });
    renderPage();
  }, [pdfDoc, currentPage, scale]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Toolbar */}
      <div className="w-64 bg-white p-4 border-r">
        <div className="space-y-4">
          <h2 className="text-lg font-bold">PDF Form Builder</h2>

          {/* PDF Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Upload PDF</label>
            <div className="relative">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="pdf-upload"
              />
              <label
                htmlFor="pdf-upload"
                className="flex items-center gap-2 cursor-pointer text-sm p-2 border rounded hover:bg-gray-50"
              >
                <Upload size={16} />
                Choose PDF
              </label>
            </div>
          </div>

          {/* Page Navigation */}
          {numPages && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Pages</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage <= 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  {currentPage} / {numPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(numPages, prev + 1))}
                  disabled={currentPage >= numPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Zoom Controls */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Zoom</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setScale(prev => Math.max(0.5, prev - 0.1))}
              >
                -
              </Button>
              <span className="text-sm">{Math.round(scale * 100)}%</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setScale(prev => Math.min(2, prev + 0.1))}
              >
                +
              </Button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Add Fields</h3>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => addField('text')}
            >
              <Type className="mr-2 h-4 w-4" /> Text Field
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => addField('textarea')}
            >
              <Type className="mr-2 h-4 w-4" /> Text Area
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => addField('number')}
            >
              <Hash className="mr-2 h-4 w-4" /> Number
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => addField('date')}
            >
              <Calendar className="mr-2 h-4 w-4" /> Date Picker
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => addField('checkbox')}
            >
              <Check className="mr-2 h-4 w-4" /> Checkbox
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => addField('radio')}
            >
              <Radio className="mr-2 h-4 w-4" /> Radio Group
            </Button>
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 p-4 overflow-auto">
        <div
          className="relative bg-white rounded-lg shadow"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => setSelectedField(null)} // Deselect when clicking empty area
        >
          {pdfDoc ? (
            <>
              <canvas
                ref={canvasRef}
                className="max-w-full"
              />

              {/* Form Fields Layer */}
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                {fields
                  .filter(field => field.page === currentPage)
                  .map(field => (
                    <FormField
                      key={field.id}
                      field={field}
                      scale={scale}
                      isSelected={selectedField?.id === field.id}
                      onSelect={setSelectedField}
                      onChange={updateField}
                      onDragStart={handleDragStart}
                    />
                  ))}
              </div>
            </>
          ) : (
            <div className="h-96 flex items-center justify-center text-gray-400">
              Upload a PDF to begin
            </div>
          )}
        </div>
      </div>

      {/* Properties Panel - Only shown when a field is selected */}
      {selectedField && (
        <div className="w-64 bg-white p-4 border-l">
          <PropertiesPanel
            field={selectedField}
            onUpdate={updateField}
            onDelete={deleteField}
          />
        </div>
      )}
    </div>
  );

};

export default PDFFormBuilder;