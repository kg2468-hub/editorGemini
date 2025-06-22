
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Toolbar } from './components/Toolbar';
import { Canvas } from './components/Canvas';
import { InitialScreen } from './components/InitialScreen';
import { ProjectSetupModal } from './components/ProjectSetupModal';
import { LayersPanel } from './components/LayersPanel'; 
import { TextInputOverlay } from './components/TextInputOverlay'; 
import { ImageCropperOverlay } from './components/ImageCropperOverlay';
import { OpacitySlider } from './components/OpacitySlider'; // Importar o novo componente
import { ToolOption, DesignElement, TextElement, ImageElement, RectangleElement, CircleElement } from './types';

const DEFAULT_CANVAS_WIDTH = 1080; 
const DEFAULT_CANVAS_HEIGHT = 1080; 
const DEFAULT_TEXT_FONT_SIZE = 24; 
const DEFAULT_IMAGE_SIZE = 150; 

const App: React.FC = () => {
  const [showInitialScreen, setShowInitialScreen] = useState<boolean>(true);
  const [isProjectSetupModalOpen, setIsProjectSetupModalOpen] = useState<boolean>(false);
  const [selectedTool, setSelectedTool] = useState<ToolOption>(ToolOption.SELECT);
  const [elements, setElements] = useState<DesignElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string>("Protótipo Astral");
  const [canvasWidth, setCanvasWidth] = useState<number>(DEFAULT_CANVAS_WIDTH);
  const [canvasHeight, setCanvasHeight] = useState<number>(DEFAULT_CANVAS_HEIGHT);
  const [isLayersPanelOpen, setIsLayersPanelOpen] = useState<boolean>(false);
  
  const [isTextInputModeActive, setIsTextInputModeActive] = useState<boolean>(false);
  const [textInputInitialValue, setTextInputInitialValue] = useState<string>("Texto");
  const [getViewportCenterInCanvasCoords, setGetViewportCenterInCanvasCoords] = 
    useState<(() => {x: number, y: number}) | null>(null);
  const [editingTextElementId, setEditingTextElementId] = useState<string | null>(null);

  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const [pendingImageForCrop, setPendingImageForCrop] = useState<string | null>(null);
  const [isImageCropperOpen, setIsImageCropperOpen] = useState<boolean>(false);
  const [editingImageElementId, setEditingImageElementId] = useState<string | null>(null);

  const [showOpacitySlider, setShowOpacitySlider] = useState<boolean>(false); // Novo estado para o slider


  const addElement = useCallback((newElementData: Omit<DesignElement, 'id'>) => {
    const newId = `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const baseElementDefaults = {
        isVisible: true,
        isLocked: false,
        opacity: 1, 
    };

    let fullNewElementData: Partial<DesignElement> = { ...baseElementDefaults, ...newElementData };

    if (newElementData.type === ToolOption.RECTANGLE && !(newElementData as RectangleElement).cornerRadius) {
        (fullNewElementData as Partial<RectangleElement>).cornerRadius = 0;
    }
     if ((newElementData.type === ToolOption.RECTANGLE || newElementData.type === ToolOption.CIRCLE) && !(newElementData as RectangleElement).strokeWidth) {
        (fullNewElementData as Partial<RectangleElement | CircleElement>).strokeWidth = 0;
        (fullNewElementData as Partial<RectangleElement | CircleElement>).strokeColor = 'transparent';
    }

    const newFullElement: DesignElement = {
      ...fullNewElementData,
      id: newId,
    } as DesignElement; 

    setElements(prevElements => [...prevElements, newFullElement]);
    setSelectedElementId(newId); 
    setSelectedTool(ToolOption.SELECT); 
  }, []);
  
  const updateElement = useCallback((id: string, updates: Partial<DesignElement>) => {
    setElements(prevElements =>
      prevElements.map(el => (el.id === id ? { ...el, ...updates } as DesignElement : el))
    );
  }, []);

  const handleEditTextElement = useCallback((elementId: string) => {
    const element = elements.find(el => el.id === elementId && el.type === ToolOption.TEXT) as TextElement | undefined;
    if (element) {
      setEditingTextElementId(element.id);
      setTextInputInitialValue(element.text);
      setIsTextInputModeActive(true);
      setSelectedElementId(element.id); 
    }
  }, [elements]);

  // Handler para fechar o slider de opacidade
  const handleCloseOpacitySlider = useCallback(() => {
    setShowOpacitySlider(false);
    if (selectedTool === ToolOption.EDIT_OPACITY) {
        setSelectedTool(ToolOption.SELECT);
    }
  }, [selectedTool]);

  useEffect(() => {
    if (!selectedElementId && showOpacitySlider) {
      handleCloseOpacitySlider();
    }
  }, [selectedElementId, showOpacitySlider, handleCloseOpacitySlider]);

  const handleToolSelect = useCallback((tool: ToolOption) => {
    const currentSelectedElement = selectedElementId ? elements.find(el => el.id === selectedElementId) : null;

    // Fechar OpacitySlider se outra ferramenta for selecionada (exceto se for a própria EDIT_OPACITY)
    if (tool !== ToolOption.EDIT_OPACITY && showOpacitySlider) {
        handleCloseOpacitySlider();
    }

    const globalTools = [ToolOption.ADD_TEXT, ToolOption.ADD_IMAGE, ToolOption.ADD_SHAPE, ToolOption.EFFECTS, ToolOption.STICKERS];
    if (globalTools.includes(tool)) {
        setSelectedElementId(null);
    }
    
    switch (tool) {
        case ToolOption.ADD_TEXT:
            setEditingTextElementId(null); 
            setTextInputInitialValue("Texto");
            setIsTextInputModeActive(true);
            setSelectedTool(ToolOption.SELECT); 
            return;
        case ToolOption.ADD_IMAGE:
            setEditingImageElementId(null); 
            if (imageFileInputRef.current) {
                imageFileInputRef.current.click(); 
            }
            setSelectedTool(ToolOption.SELECT); 
            return;
        case ToolOption.ADD_SHAPE:
            {
                let centerX, centerY;
                const getterFn = getViewportCenterInCanvasCoords;
                if (typeof getterFn === 'function') {
                    const coords = getterFn();
                    centerX = coords.x;
                    centerY = coords.y;
                } else {
                    centerX = canvasWidth / 2;
                    centerY = canvasHeight / 2;
                }
                const elementSize = 80; 
                const newShape: Omit<RectangleElement, 'id'> = {
                    type: ToolOption.RECTANGLE,
                    x: centerX - elementSize / 2,
                    y: centerY - elementSize / 2,
                    width: elementSize,
                    height: elementSize,
                    backgroundColor: '#3B82F6', 
                    rotation: 0,
                    strokeWidth: 0,
                    strokeColor: 'transparent',
                    cornerRadius: 0,
                };
                addElement(newShape); 
                return; 
            }
        case ToolOption.EFFECTS:
            console.log("Ação 'Efeitos Globais' disparada!");
            setSelectedTool(ToolOption.SELECT); 
            return;
        case ToolOption.STICKERS:
            console.log("Ação 'Stickers Globais' disparada!");
            setSelectedTool(ToolOption.SELECT); 
            return;

        case ToolOption.EDIT_OPACITY:
            if (currentSelectedElement) {
                setShowOpacitySlider(prev => !prev); // Alterna a visibilidade do slider
                if (!showOpacitySlider) { // Se está abrindo o slider
                    setSelectedTool(ToolOption.EDIT_OPACITY);
                } else { // Se está fechando o slider pelo botão de opacidade
                    setSelectedTool(ToolOption.SELECT);
                }
            } else {
                // Nenhum elemento selecionado, garantir que o slider esteja fechado e ferramenta seja SELECT
                setShowOpacitySlider(false);
                setSelectedTool(ToolOption.SELECT);
            }
            return; 
        case ToolOption.EDIT_TEXT_CONTENT:
            if (currentSelectedElement && currentSelectedElement.type === ToolOption.TEXT) {
                handleEditTextElement(currentSelectedElement.id);
            }
            setSelectedTool(ToolOption.SELECT); // Reverter para SELECT após iniciar a ação
            return;
        case ToolOption.EDIT_IMAGE_CROP:
            if (currentSelectedElement && currentSelectedElement.type === ToolOption.IMAGE) {
                setEditingImageElementId(currentSelectedElement.id);
                setPendingImageForCrop((currentSelectedElement as ImageElement).src);
                setIsImageCropperOpen(true);
            }
            setSelectedTool(ToolOption.SELECT); // Reverter para SELECT após iniciar a ação
            return;
        
        case ToolOption.EDIT_FONT_FAMILY:
        case ToolOption.EDIT_TEXT_COLOR:
        case ToolOption.EDIT_TEXT_ALIGNMENT:
        case ToolOption.EDIT_IMAGE_FILTERS:
        case ToolOption.EDIT_IMAGE_ADJUSTMENTS:
        case ToolOption.EDIT_SHAPE_FILL_COLOR:
        case ToolOption.EDIT_SHAPE_STROKE_COLOR:
        case ToolOption.EDIT_SHAPE_STROKE_WIDTH:
        case ToolOption.EDIT_SHAPE_CORNER_RADIUS:
            if(currentSelectedElement) {
                console.log(`Ação '${tool}' disparada para elemento: ${currentSelectedElement.id}`);
                // Geralmente, após disparar uma ação de edição que não abre um sub-painel como o slider,
                // você pode querer que a ferramenta permaneça contextual ou volte para SELECT.
                // Por enquanto, vamos manter a ferramenta atual (contextual) ou definir para SELECT se a ação for "instantânea".
                // Se a ação abre um modal (ex: color picker), então setSelectedTool(tool) é bom.
                // Se é um toggle (ex: bold), pode voltar para SELECT ou manter.
                // Para console.log, vamos manter a ferramenta selecionada por enquanto (que seria a própria ferramenta de edição)
                setSelectedTool(tool); // Mantém a ferramenta de edição selecionada
            } else {
                 console.log(`Ação '${tool}' disparada, mas nenhum elemento selecionado.`);
                 setSelectedTool(ToolOption.SELECT); // Se não há elemento, volta para SELECT
            }
            return; 

        default:
            setSelectedTool(tool); 
    }
  }, [selectedElementId, elements, getViewportCenterInCanvasCoords, canvasWidth, canvasHeight, addElement, updateElement, handleEditTextElement, showOpacitySlider, handleCloseOpacitySlider]); // Adicionado showOpacitySlider e handleCloseOpacitySlider

  const handleStartCreating = () => {
    setCanvasWidth(DEFAULT_CANVAS_WIDTH);
    setCanvasHeight(DEFAULT_CANVAS_HEIGHT);
    setIsProjectSetupModalOpen(true);
  };

  const handleConfirmProjectSetup = (config: { name: string; width: number; height: number }) => {
    setProjectName(config.name);
    setCanvasWidth(config.width);
    setCanvasHeight(config.height);
    setElements([]); 
    setSelectedElementId(null);
    setSelectedTool(ToolOption.SELECT);
    setIsProjectSetupModalOpen(false);
    setShowInitialScreen(false);
    setIsLayersPanelOpen(false);
    setEditingTextElementId(null);
    setEditingImageElementId(null);
    setShowOpacitySlider(false); // Resetar slider
  };

  const handleCloseProjectSetupModal = () => {
    setIsProjectSetupModalOpen(false);
  };

  const handleGoHome = () => {
    setShowInitialScreen(true);
    setIsLayersPanelOpen(false); 
    setIsTextInputModeActive(false); 
    setEditingTextElementId(null);
    setIsImageCropperOpen(false);
    setPendingImageForCrop(null);
    setEditingImageElementId(null);
    setShowOpacitySlider(false); // Resetar slider
  };

  const toggleLayersPanel = () => {
    setIsLayersPanelOpen(prev => !prev);
  };
  
  const handleSetSelectedElementId = useCallback((id: string | null) => {
    if (id) {
        const element = elements.find(el => el.id === id);
        if (element && !element.isLocked) {
             setSelectedElementId(id);
        } else if (element && element.isLocked) {
            setSelectedElementId(null); 
        } else if (!element) {
            setSelectedElementId(null);
        }
    } else {
        setSelectedElementId(null);
    }
  }, [elements]);

  const handleConfirmTextInput = (confirmedText: string) => {
    setIsTextInputModeActive(false); 

    if (editingTextElementId) {
      const originalElement = elements.find(el => el.id === editingTextElementId) as TextElement | undefined;
      if (!originalElement) {
        setEditingTextElementId(null);
        return;
      }
      
      const approximateCharWidth = originalElement.fontSize * 0.6; 
      const lines = confirmedText.split('\n');
      const longestLineLength = Math.max(...lines.map(line => line.length), 0);
      
      const newWidth = Math.max(50, Math.min(canvasWidth * 0.9, longestLineLength * approximateCharWidth + originalElement.fontSize * 2)); 
      const newHeight = Math.max(originalElement.fontSize * 1.5, lines.length * (originalElement.fontSize * 1.4) + originalElement.fontSize * 0.5);

      updateElement(editingTextElementId, { 
        text: confirmedText,
        width: newWidth,
        height: newHeight,
      });
      setEditingTextElementId(null);
    } else {
      let centerX, centerY;
      const getterFn = getViewportCenterInCanvasCoords;

      if (typeof getterFn === 'function') {
        const coords = getterFn();
        centerX = coords.x;
        centerY = coords.y;
      } else {
        centerX = canvasWidth / 2;
        centerY = canvasHeight / 2;
      }

      const approximateCharWidth = DEFAULT_TEXT_FONT_SIZE * 0.6;
      const lines = confirmedText.split('\n');
      const longestLineLength = Math.max(...lines.map(line => line.length), 0);
      const textElementWidth = Math.max(50, Math.min(canvasWidth * 0.8, longestLineLength * approximateCharWidth + DEFAULT_TEXT_FONT_SIZE * 2));
      const textElementHeight = Math.max(DEFAULT_TEXT_FONT_SIZE * 1.5, lines.length * (DEFAULT_TEXT_FONT_SIZE * 1.4) + DEFAULT_TEXT_FONT_SIZE * 0.5);

      const newTextElement: Omit<TextElement, 'id'> = {
          type: ToolOption.TEXT,
          text: confirmedText,
          x: centerX - textElementWidth / 2,
          y: centerY - textElementHeight / 2,
          width: textElementWidth,
          height: textElementHeight,
          fontSize: DEFAULT_TEXT_FONT_SIZE,
          fontFamily: 'Arial',
          color: '#333333',
          textAlign: 'center',
          opacity: 1,
      };
      addElement(newTextElement); 
    }
  };

  const handleCancelTextInput = () => {
    setIsTextInputModeActive(false);
    setEditingTextElementId(null); 
  };
  
  const handleImageFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === 'string') {
          setPendingImageForCrop(e.target.result);
          setIsImageCropperOpen(true);
        }
      };
      reader.readAsDataURL(file);
      event.target.value = ''; 
    }
  };

  const handleConfirmCrop = (croppedImageDataUrl: string) => {
    setIsImageCropperOpen(false);
    setPendingImageForCrop(null);

    const img = new Image();
    img.onload = () => {
        const aspectRatio = img.width / img.height;
        let newWidth = DEFAULT_IMAGE_SIZE;
        let newHeight = DEFAULT_IMAGE_SIZE / aspectRatio;

        if (img.width > img.height) { 
            newHeight = DEFAULT_IMAGE_SIZE;
            newWidth = DEFAULT_IMAGE_SIZE * aspectRatio;
        } else { 
            newWidth = DEFAULT_IMAGE_SIZE;
            newHeight = DEFAULT_IMAGE_SIZE / aspectRatio;
        }
        newWidth = Math.min(newWidth, canvasWidth * 0.8);
        newHeight = Math.min(newHeight, canvasHeight * 0.8);

        if (editingImageElementId) {
            updateElement(editingImageElementId, {
                src: croppedImageDataUrl,
                width: newWidth,
                height: newHeight,
            });
            setEditingImageElementId(null);
        } else {
            let centerX, centerY;
            const getterFn = getViewportCenterInCanvasCoords;
            if (typeof getterFn === 'function') {
                const coords = getterFn();
                centerX = coords.x;
                centerY = coords.y;
            } else {
                centerX = canvasWidth / 2;
                centerY = canvasHeight / 2;
            }
            const newImageElement: Omit<ImageElement, 'id'> = {
                type: ToolOption.IMAGE,
                src: croppedImageDataUrl,
                alt: 'Imagem Recortada',
                x: centerX - newWidth / 2,
                y: centerY - newHeight / 2,
                width: newWidth,
                height: newHeight,
                rotation: 0,
                opacity: 1,
            };
            addElement(newImageElement);
        }
    };
    img.onerror = () => {
        console.error("Erro ao carregar dimensões da imagem recortada.");
        setEditingImageElementId(null);
    }
    img.src = croppedImageDataUrl;
  };

  const handleCancelCrop = () => {
    setIsImageCropperOpen(false);
    setPendingImageForCrop(null);
    setEditingImageElementId(null);
  };

  const handleToggleElementVisibility = useCallback((elementId: string) => {
    setElements(prevElements =>
      prevElements.map(el =>
        el.id === elementId ? { ...el, isVisible: !(el.isVisible ?? true) } : el
      )
    );
  }, []);

  const handleToggleElementLock = useCallback((elementId: string) => {
    setElements(prevElements => {
        const newElements = prevElements.map(el =>
            el.id === elementId ? { ...el, isLocked: !(el.isLocked ?? false) } : el
        );
        const toggledElement = newElements.find(e => e.id === elementId);
        if (selectedElementId === elementId && toggledElement?.isLocked) {
             setSelectedElementId(null);
        }
        return newElements;
    });
  }, [selectedElementId]);


  const handleReorderElements = useCallback((draggedId: string, targetId: string | null, position: 'before' | 'after') => {
    setElements(prevElements => {
        const draggedIndex = prevElements.findIndex(el => el.id === draggedId);
        if (draggedIndex === -1) return prevElements;

        const newElements = [...prevElements];
        const [draggedItem] = newElements.splice(draggedIndex, 1);

        if (targetId === null) { 
            if (position === 'before') { 
                 newElements.push(draggedItem);
            } else { 
                 newElements.unshift(draggedItem);
            }
        } else {
            const targetIndex = newElements.findIndex(el => el.id === targetId);
            if (targetIndex === -1) { 
                newElements.splice(draggedIndex, 0, draggedItem);
                return newElements;
            }
            if (position === 'before') {
                newElements.splice(targetIndex + 1, 0, draggedItem);
            } else { 
                newElements.splice(targetIndex, 0, draggedItem);
            }
        }
        return newElements;
    });
  }, []);

  // Handler para atualizar opacidade a partir do slider
  const handleOpacityChangeFromSlider = useCallback((newOpacity: number) => {
    if (selectedElementId) {
      updateElement(selectedElementId, { opacity: parseFloat(newOpacity.toFixed(2)) });
    }
  }, [selectedElementId, updateElement]);

  const selectedElementObject = selectedElementId ? elements.find(el => el.id === selectedElementId) : null;

  if (showInitialScreen) {
    return (
      <>
        <InitialScreen onStartCreating={handleStartCreating} />
        {isProjectSetupModalOpen && (
          <ProjectSetupModal
            isOpen={isProjectSetupModalOpen}
            onClose={handleCloseProjectSetupModal}
            onSubmit={handleConfirmProjectSetup}
            defaultProjectName={projectName} 
            defaultCanvasWidth={DEFAULT_CANVAS_WIDTH}
            defaultCanvasHeight={DEFAULT_CANVAS_HEIGHT}
          />
        )}
      </>
    );
  }

  return (
    <div className="flex flex-col h-screen antialiased bg-gray-900 text-gray-100 overflow-hidden">
      <input
        type="file"
        accept="image/*"
        ref={imageFileInputRef}
        onChange={handleImageFileSelected}
        style={{ display: 'none' }}
        aria-hidden="true"
      />
      <Header 
        title="Criador de Design Móvel" 
        projectName={projectName}
        onGoHome={handleGoHome}
        isLayersPanelOpen={isLayersPanelOpen}
        onToggleLayersPanel={toggleLayersPanel}
      />
      <div className="flex flex-1 overflow-hidden relative"> {/* Adicionado relative para o slider */}
        <main className="flex-1 bg-gray-700 overflow-hidden relative">
          <Canvas 
            elements={elements}
            selectedTool={selectedTool} 
            setSelectedElementId={handleSetSelectedElementId}
            selectedElementId={selectedElementId}
            updateElementPosition={updateElement} 
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            onViewportReady={setGetViewportCenterInCanvasCoords}
            onEditTextElement={handleEditTextElement} 
          />
        </main>
        {isLayersPanelOpen && (
             <LayersPanel
                isOpen={isLayersPanelOpen}
                onClose={toggleLayersPanel}
                elements={elements}
                selectedElementId={selectedElementId}
                onSelectElement={handleSetSelectedElementId}
                onToggleVisibility={handleToggleElementVisibility}
                onToggleLock={handleToggleElementLock}
                onReorderElements={handleReorderElements}
            />
        )}
      </div>
      
      {/* Opacity Slider - Renderizado acima da Toolbar */}
      {selectedElementObject && ( // Renderiza o slider apenas se um elemento estiver selecionado
          <OpacitySlider
              isOpen={showOpacitySlider}
              currentOpacity={selectedElementObject?.opacity ?? 1}
              onOpacityChange={handleOpacityChangeFromSlider}
              onClose={handleCloseOpacitySlider}
          />
      )}

      <Toolbar 
        selectedTool={selectedTool} 
        onSelectTool={handleToolSelect}
        selectedElement={selectedElementObject}
      />

      <TextInputOverlay
        isOpen={isTextInputModeActive}
        initialValue={textInputInitialValue}
        onConfirm={handleConfirmTextInput}
        onCancel={handleCancelTextInput}
      />
      {isImageCropperOpen && pendingImageForCrop && (
        <ImageCropperOverlay
          isOpen={isImageCropperOpen}
          imageSrc={pendingImageForCrop}
          onConfirm={handleConfirmCrop}
          onCancel={handleCancelCrop}
        />
      )}
    </div>
  );
};

export default App;
