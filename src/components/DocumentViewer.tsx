import { 
  FileText, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Move, 
  PenTool, 
  Highlighter, 
  MessageSquare,
  Search,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Loader2,
  Printer,
  Share2,
  ThumbsUp,
  ThumbsDown,
  Eye,
  File,
  Image,
  FileSpreadsheet,
  Presentation
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface Annotation {
  id: string;
  type: 'highlight' | 'note' | 'draw';
  x: number;
  y: number;
  width?: number;
  height?: number;
  content?: string;
  color: string;
  createdAt: string;
}

interface DocumentViewerProps {
  documentUrl?: string;
  documentName?: string;
  documentType?: string;
  onAnnotationAdd?: (annotation: Annotation) => void;
  onAnnotationRemove?: (id: string) => void;
  isLoading?: boolean;
}

export default function DocumentViewer({
  documentUrl,
  documentName = 'Document',
  documentType = 'pdf',
  onAnnotationAdd,
  onAnnotationRemove,
  isLoading = false
}: DocumentViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [activeTool, setActiveTool] = useState<'select' | 'highlight' | 'draw' | 'note' | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (canvasRef.current && activeTool === 'draw') {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [activeTool]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const handleAddAnnotation = (type: Annotation['type'], x: number, y: number) => {
    const newAnnotation: Annotation = {
      id: `ann-${Date.now()}`,
      type,
      x,
      y,
      color: type === 'highlight' ? '#fef08a' : '#6366f1',
      createdAt: new Date().toISOString(),
      ...(type === 'note' && { content: '' })
    };
    setAnnotations(prev => [...prev, newAnnotation]);
    onAnnotationAdd?.(newAnnotation);
    setSelectedAnnotation(newAnnotation.id);
  };

  const handleRemoveAnnotation = (id: string) => {
    setAnnotations(prev => prev.filter(a => a.id !== id));
    onAnnotationRemove?.(id);
    setSelectedAnnotation(null);
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setTimeout(() => {
      setSearchResults([1, 2, 3]);
      setIsSearching(false);
    }, 500);
  };

  const handleDownload = () => {
    window.open(documentUrl || '#', '_blank');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return <FileText className="w-5 h-5" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Image className="w-5 h-5" />;
      case 'xlsx':
      case 'xls':
      case 'csv':
        return <FileSpreadsheet className="w-5 h-5" />;
      case 'pptx':
      case 'ppt':
        return <Presentation className="w-5 h-5" />;
      default:
        return <File className="w-5 h-5" />;
    }
  };

  const highlightColors = [
    { name: 'Yellow', value: '#fef08a' },
    { name: 'Green', value: '#bbf7d0' },
    { name: 'Blue', value: '#bfdbfe' },
    { name: 'Pink', value: '#fbcfe8' },
    { name: 'Orange', value: '#fed7aa' }
  ];

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Loading Document</h3>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center h-[600px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-4" />
            <p className="text-slate-500">Loading document...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col"
    >
      {/* Header Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
            {getFileIcon(documentType)}
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 max-w-[200px] truncate">
              {documentName}
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm text-slate-500">
            <span>Page</span>
            <input
              type="number"
              value={currentPage}
              onChange={(e) => setCurrentPage(Math.max(1, Math.min(totalPages, parseInt(e.target.value) || 1)))}
              className="w-12 px-2 py-1 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded"
              min={1}
              max={totalPages}
            />
            <span>of {totalPages}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Search */}
          <div className="flex items-center gap-1 mr-2">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search..."
                className="w-32 px-3 py-1.5 pr-8 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
            {isSearching && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />}
          </div>

          {/* Zoom Controls */}
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-sm text-slate-500 w-14 text-center">{zoom}%</span>
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2" />

          {/* Rotation */}
          <button
            onClick={handleRotate}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Rotate"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2" />

          {/* Actions */}
          <button
            onClick={handleDownload}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Print"
          >
            <Printer className="w-4 h-4" />
          </button>
          <button
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Annotation Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTool(activeTool === 'select' ? null : 'select')}
            className={`p-2 rounded-lg transition-colors ${
              activeTool === 'select' 
                ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Select"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTool(activeTool === 'highlight' ? null : 'highlight')}
            className={`p-2 rounded-lg transition-colors ${
              activeTool === 'highlight' 
                ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Highlight"
          >
            <Highlighter className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTool(activeTool === 'draw' ? null : 'draw')}
            className={`p-2 rounded-lg transition-colors ${
              activeTool === 'draw' 
                ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Draw"
          >
            <PenTool className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTool(activeTool === 'note' ? null : 'note')}
            className={`p-2 rounded-lg transition-colors ${
              activeTool === 'note' 
                ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Add Note"
          >
            <MessageSquare className="w-4 h-4" />
          </button>

          {activeTool === 'highlight' && (
            <div className="flex items-center gap-1 ml-2 pl-2 border-l border-slate-200 dark:border-slate-700">
              {highlightColors.map((color) => (
                <button
                  key={color.value}
                  className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 shadow-sm hover:scale-110 transition-transform"
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAnnotations(!showAnnotations)}
            className={`p-2 rounded-lg transition-colors ${
              showAnnotations 
                ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Toggle Annotations"
          >
            <Eye className="w-4 h-4" />
          </button>
          {annotations.length > 0 && (
            <span className="text-xs text-slate-500">
              {annotations.length} annotation{annotations.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Document Viewport */}
      <div className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-800 p-8">
        <div 
          className="mx-auto bg-white dark:bg-slate-900 shadow-lg relative"
          style={{ 
            width: '612px', 
            height: '792px',
            transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
            transformOrigin: 'center top'
          }}
        >
          {/* Placeholder for actual document content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center">
                {getFileIcon(documentType)}
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                {documentName}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {documentType.toUpperCase()} Document
              </p>
              <p className="text-xs text-slate-400 mt-4">
                Document preview would be rendered here
              </p>
            </div>
          </div>

          {/* Annotations Layer */}
          {showAnnotations && annotations.map((annotation) => (
            <div
              key={annotation.id}
              className={`absolute cursor-pointer transition-all ${
                selectedAnnotation === annotation.id ? 'ring-2 ring-indigo-500 ring-offset-2' : ''
              }`}
              style={{
                left: annotation.x,
                top: annotation.y,
                width: annotation.width,
                height: annotation.height,
                backgroundColor: annotation.type === 'highlight' ? annotation.color : 'transparent',
                borderRadius: annotation.type === 'highlight' ? '2px' : '0'
              }}
              onClick={() => setSelectedAnnotation(annotation.id)}
            >
              {annotation.type === 'note' && (
                <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white">
                  <MessageSquare className="w-3 h-3" />
                </div>
              )}
            </div>
          ))}

          {/* Drawing Canvas */}
          {activeTool === 'draw' && (
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-auto"
              width={612}
              height={792}
            />
          )}
        </div>
      </div>

      {/* Page Navigation */}
      <div className="flex items-center justify-center gap-4 px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <button
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Annotation Detail Panel */}
      {selectedAnnotation && (
        <div className="absolute right-4 top-20 w-72 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-slate-900 dark:text-white">Annotation</h4>
            <button
              onClick={() => setSelectedAnnotation(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {(() => {
            const annotation = annotations.find(a => a.id === selectedAnnotation);
            if (!annotation) return null;
            return (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">Type:</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white capitalize">
                    {annotation.type}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">Created:</span>
                  <span className="text-sm text-slate-900 dark:text-white">
                    {new Date(annotation.createdAt).toLocaleString()}
                  </span>
                </div>
                {annotation.content && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Content:</p>
                    <p className="text-sm text-slate-900 dark:text-white">{annotation.content}</p>
                  </div>
                )}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <button className="flex-1 p-2 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">
                    <ThumbsUp className="w-4 h-4 mx-auto" />
                  </button>
                  <button className="flex-1 p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <ThumbsDown className="w-4 h-4 mx-auto" />
                  </button>
                  <button 
                    onClick={() => handleRemoveAnnotation(annotation.id)}
                    className="flex-1 p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <X className="w-4 h-4 mx-auto" />
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
