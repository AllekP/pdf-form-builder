import React, { useState, useEffect, useRef } from 'react';
import { PlusIcon, AlignLeftIcon, AlignCenterIcon, AlignRightIcon } from 'lucide-react';

const FormField = ({ field, isSelected, onSelect, onChange, onDragStart, scale, snapToGrid }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [initialSize, setInitialSize] = useState({ width: field.width, height: field.height });
  const [initialPosition, setInitialPosition] = useState({ x: field.x, y: field.y });
  const fieldRef = useRef(null);

  useEffect(() => {
    setInitialSize({ width: field.width, height: field.height });
    setInitialPosition({ x: field.x, y: field.y });
  }, [field.width, field.height, field.x, field.y]);

  const handleDragStart = (e) => {
    e.stopPropagation();

    // Calculate offset within the field, considering scale
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = (e.clientX - rect.left) / scale;
    const offsetY = (e.clientY - rect.top) / scale;

    e.dataTransfer.setData('field', JSON.stringify({
      ...field,
      // Store the scaled offsets
      offsetX: offsetX * scale,
      offsetY: offsetY * scale
    }));

    onDragStart(field, offsetX, offsetY);
  };

  const handleMouseDown = (e) => {
    if (e.target.classList.contains('resize-handle')) {
      setIsDragging(true);
      setInitialSize({ width: field.width, height: field.height });
    } else {
      onSelect(field);
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && fieldRef.current) {
      let newWidth = e.clientX - fieldRef.current.offsetLeft;
      let newHeight = e.clientY - fieldRef.current.offsetTop;

      // Maintain aspect ratio if option is enabled
      if (field.maintainAspectRatio) {
        const aspectRatio = initialSize.width / initialSize.height;
        newHeight = newWidth / aspectRatio;
      }

      // Apply min/max size limits
      newWidth = Math.max(Math.min(newWidth / scale, field.maxWidth), field.minWidth);
      newHeight = Math.max(Math.min(newHeight / scale, field.maxHeight), field.minHeight);

      onChange({ ...field, width: newWidth, height: newHeight });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleAlign = (alignment) => {
    let newX, newY;
    switch (alignment) {
      case 'left':
        newX = 0;
        break;
      case 'center':
        newX = (parent.width - field.width) / 2;
        break;
      case 'right':
        newX = parent.width - field.width;
        break;
    }

    if (snapToGrid) {
      newX = Math.round(newX / gridSize) * gridSize;
      newY = Math.round(field.y / gridSize) * gridSize;
    }

    onChange({ ...field, x: newX, y: newY });
  };

  const handleDistributeHorizontally = () => {
    const selectedFields = fields.filter((f) => f.isSelected);
    if (selectedFields.length <= 1) return;

    let minX = Math.min(...selectedFields.map((f) => f.x));
    let maxX = Math.max(...selectedFields.map((f) => f.x + f.width));
    const totalWidth = maxX - minX;
    const spacing = totalWidth / (selectedFields.length - 1);

    selectedFields.forEach((f, i) => {
      let newX = minX + i * spacing - f.width / 2;
      if (snapToGrid) {
        newX = Math.round(newX / gridSize) * gridSize;
      }
      onChange({ ...f, x: newX, y: f.y });
    });
  };

  const handleDistributeVertically = () => {
    const selectedFields = fields.filter((f) => f.isSelected);
    if (selectedFields.length <= 1) return;

    let minY = Math.min(...selectedFields.map((f) => f.y));
    let maxY = Math.max(...selectedFields.map((f) => f.y + f.height));
    const totalHeight = maxY - minY;
    const spacing = totalHeight / (selectedFields.length - 1);

    selectedFields.forEach((f, i) => {
      let newY = minY + i * spacing - f.height / 2;
      if (snapToGrid) {
        newY = Math.round(newY / gridSize) * gridSize;
      }
      onChange({ ...f, x: f.x, y: newY });
    });
  };

  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={field.value || ''}
            onChange={(e) => onChange({ ...field, value: e.target.value })}
            className="w-full h-full px-2 border-b border-gray-400 focus:outline-none text-sm"
            placeholder={field.placeholder}
            onClick={(e) => e.stopPropagation()}
          />
        );

      // ... (other field types remain the same)
    }
  };

  return (
    <div
      ref={fieldRef}
      draggable={true}
      onDragStart={handleDragStart}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(field);
      }}
      style={{
        position: 'absolute',
        left: `${field.x * scale}px`,
        top: `${field.y * scale}px`,
        width: `${field.width * scale}px`,
        height: `${field.height * scale}px`,
        border: isSelected ? '2px solid #2196F3' : '1px solid #ddd',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        cursor: 'move',
        zIndex: isSelected ? 2 : 1,
        pointerEvents: 'auto',
      }}
    >
      {renderField()}
      {/* <div className="absolute bottom-0 right-0 p-1 bg-gray-200 rounded-tl-md cursor-nwse-resize resize-handle">
        <PlusIcon size={16} />
      </div> */}
      {/* {isSelected && (
        <div className="absolute top-0 left-0 flex space-x-2 p-2">
          <AlignLeftIcon
            className="cursor-pointer"
            onClick={() => handleAlign('left')}
          />
          <AlignCenterIcon
            className="cursor-pointer"
            onClick={() => handleAlign('center')}
          />
          <AlignRightIcon
            className="cursor-pointer"
            onClick={() => handleAlign('right')}
          />
          <button
            className="cursor-pointer"
            onClick={handleDistributeHorizontally}
          >
            Distribute Horizontally
          </button>
          <button
            className="cursor-pointer"
            onClick={handleDistributeVertically}
          >
            Distribute Vertically
          </button>
        </div>
      )} */}
    </div>
  );
};

export default FormField;