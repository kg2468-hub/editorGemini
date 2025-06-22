
export enum ToolOption {
  SELECT = 'SELECT',
  // Tools for adding new elements
  ADD_TEXT = 'ADD_TEXT',
  ADD_IMAGE = 'ADD_IMAGE',
  ADD_SHAPE = 'ADD_SHAPE',
  EFFECTS = 'EFFECTS', // General effects tool
  STICKERS = 'STICKERS', // General stickers tool

  // Element types (used in element.type)
  TEXT = 'TEXT', 
  RECTANGLE = 'RECTANGLE',
  IMAGE = 'IMAGE',
  CIRCLE = 'CIRCLE',

  // Contextual Tools for Text
  EDIT_TEXT_CONTENT = 'EDIT_TEXT_CONTENT',
  EDIT_FONT_FAMILY = 'EDIT_FONT_FAMILY',
  EDIT_FONT_SIZE = 'EDIT_FONT_SIZE', // May not be a direct button, but part of font properties
  EDIT_TEXT_COLOR = 'EDIT_TEXT_COLOR',
  EDIT_TEXT_ALIGNMENT = 'EDIT_TEXT_ALIGNMENT',
  // Placeholder text tools
  EDIT_TEXT_STROKE = 'EDIT_TEXT_STROKE',
  EDIT_TEXT_BACKGROUND = 'EDIT_TEXT_BACKGROUND',
  EDIT_TEXT_SHADOW = 'EDIT_TEXT_SHADOW',
  EDIT_TEXT_CURVATURE = 'EDIT_TEXT_CURVATURE',
  EDIT_TEXT_SPACING = 'EDIT_TEXT_SPACING',


  // Contextual Tools for Images
  EDIT_IMAGE_CROP = 'EDIT_IMAGE_CROP',
  EDIT_IMAGE_FILTERS = 'EDIT_IMAGE_FILTERS',
  EDIT_IMAGE_ADJUSTMENTS = 'EDIT_IMAGE_ADJUSTMENTS', // (Luz, Exposição, Vinheta, Nivel...)
  EDIT_IMAGE_ERASE_RESTORE = 'EDIT_IMAGE_ERASE_RESTORE',
  EDIT_IMAGE_EFFECTS = 'EDIT_IMAGE_EFFECTS', // Specific image effects
  EDIT_IMAGE_DISTORTION = 'EDIT_IMAGE_DISTORTION',
  EDIT_IMAGE_STROKE = 'EDIT_IMAGE_STROKE', // Renamed from Contorno
  EDIT_IMAGE_SHADOW = 'EDIT_IMAGE_SHADOW',


  // Contextual Tools for Shapes
  EDIT_SHAPE_TYPE = 'EDIT_SHAPE_TYPE', // Mudar forma (quadrado para círculo etc)
  EDIT_SHAPE_FILL_COLOR = 'EDIT_SHAPE_FILL_COLOR',
  EDIT_SHAPE_STROKE_COLOR = 'EDIT_SHAPE_STROKE_COLOR',
  EDIT_SHAPE_STROKE_WIDTH = 'EDIT_SHAPE_STROKE_WIDTH',
  EDIT_SHAPE_CORNER_RADIUS = 'EDIT_SHAPE_CORNER_RADIUS', // For rectangles
  EDIT_SHAPE_ERASE_RESTORE = 'EDIT_SHAPE_ERASE_RESTORE', // Similar to image
  EDIT_SHAPE_DISTORTION = 'EDIT_SHAPE_DISTORTION', // Similar to image
  EDIT_SHAPE_SHADOW = 'EDIT_SHAPE_SHADOW',

  // Common Contextual Tools
  EDIT_OPACITY = 'EDIT_OPACITY',
  DELETE_ELEMENT = 'DELETE_ELEMENT', // Placeholder for delete action
}

export interface BaseElement {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  isVisible?: boolean; 
  isLocked?: boolean;  
  opacity?: number; // Range 0 to 1, default 1
}

export interface TextElement extends BaseElement {
  type: ToolOption.TEXT; 
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  fontWeight?: 'normal' | 'bold';
  textAlign?: 'left' | 'center' | 'right';
  // Future text properties: strokeColor, strokeWidth, backgroundColor, shadow, curvature, letterSpacing, lineHeight
}

export interface RectangleElement extends BaseElement {
  type: ToolOption.RECTANGLE; 
  backgroundColor: string;
  strokeColor?: string; // Renamed from borderColor
  strokeWidth?: number; // Renamed from borderWidth
  cornerRadius?: number; // For rounded corners
}

export interface CircleElement extends BaseElement {
  type: ToolOption.CIRCLE; 
  backgroundColor: string;
  strokeColor?: string; // Renamed from borderColor
  strokeWidth?: number; // Renamed from borderWidth
}

export interface ImageElement extends BaseElement {
  type: ToolOption.IMAGE; 
  src: string;
  alt?: string;
  // Future image properties: filters (object), adjustments (object), stroke, shadow
}

export type DesignElement = TextElement | RectangleElement | ImageElement | CircleElement;
