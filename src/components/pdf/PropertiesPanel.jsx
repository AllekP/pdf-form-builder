// src/components/pdf/PropertiesPanel.jsx
import React from 'react';
import { Button } from '../ui/button';
import { Plus, X } from 'lucide-react';

const PropertiesPanel = ({ field, onUpdate, onDelete }) => {
  if (!field) return null;

  // Handle adding a new option to select/radio fields
  const handleAddOption = () => {
    const options = field.options || [];
    onUpdate({
      ...field,
      options: [...options, `Option ${options.length + 1}`]
    });
  };

  // Handle removing an option
  const handleRemoveOption = (indexToRemove) => {
    onUpdate({
      ...field,
      options: field.options.filter((_, index) => index !== indexToRemove)
    });
  };

  // Render different properties based on field type
  const renderFieldSpecificProperties = () => {
    switch (field.type) {
      case 'select':
      case 'radio':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Options</label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddOption}
                className="h-8 px-2"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...field.options];
                      newOptions[index] = e.target.value;
                      onUpdate({ ...field, options: newOptions });
                    }}
                    className="flex-1 p-2 border rounded"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveOption(index)}
                    className="h-8 px-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'number':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Min</label>
                <input
                  type="number"
                  value={field.min}
                  onChange={(e) => onUpdate({ ...field, min: Number(e.target.value) })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max</label>
                <input
                  type="number"
                  value={field.max}
                  onChange={(e) => onUpdate({ ...field, max: Number(e.target.value) })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Step</label>
                <input
                  type="number"
                  value={field.step}
                  onChange={(e) => onUpdate({ ...field, step: Number(e.target.value) })}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          </div>
        );

        case 'date':
            return (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Default Value</label>
                  <input
                    type="date"
                    value={field.value || ''}
                    onChange={(e) => onUpdate({ ...field, value: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Min Date</label>
                  <input
                    type="date"
                    value={field.minDate || ''}
                    onChange={(e) => onUpdate({ ...field, minDate: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Max Date</label>
                  <input
                    type="date"
                    value={field.maxDate || ''}
                    onChange={(e) => onUpdate({ ...field, maxDate: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold">Field Properties</h2>
      
      {/* Field Type */}
      <div>
        <label className="block text-sm font-medium mb-1">Type</label>
        <div className="text-sm capitalize">{field.type}</div>
      </div>

      {/* Field Label */}
      <div>
        <label className="block text-sm font-medium mb-1">Label</label>
        <input
          type="text"
          value={field.label || ''}
          onChange={(e) => onUpdate({ ...field, label: e.target.value })}
          className="w-full p-2 border rounded"
        />
      </div>

      {/* Placeholder (for applicable fields) */}
      {['text', 'textarea', 'number', 'select'].includes(field.type) && (
        <div>
          <label className="block text-sm font-medium mb-1">Placeholder</label>
          <input
            type="text"
            value={field.placeholder || ''}
            onChange={(e) => onUpdate({ ...field, placeholder: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>
      )}

      {/* Field-specific properties */}
      {renderFieldSpecificProperties()}

      {/* Position */}
      <div>
        <label className="block text-sm font-medium mb-1">Position</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs">X</label>
            <input
              type="number"
              value={Math.round(field.x)}
              onChange={(e) => onUpdate({ ...field, x: Number(e.target.value) })}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-xs">Y</label>
            <input
              type="number"
              value={Math.round(field.y)}
              onChange={(e) => onUpdate({ ...field, y: Number(e.target.value) })}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      </div>

      {/* Size */}
      <div>
        <label className="block text-sm font-medium mb-1">Size</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs">Width</label>
            <input
              type="number"
              value={field.width}
              onChange={(e) => onUpdate({ ...field, width: Number(e.target.value) })}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-xs">Height</label>
            <input
              type="number"
              value={field.height}
              onChange={(e) => onUpdate({ ...field, height: Number(e.target.value) })}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      </div>

      {/* Delete Button */}
      <Button 
        variant="destructive"
        className="w-full"
        onClick={() => onDelete(field.id)}
      >
        Delete Field
      </Button>
    </div>
  );
};

export default PropertiesPanel;