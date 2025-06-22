
import { ToolOption, DesignElement } from './types';
import { 
    TypeIcon, ImageIcon, ShapesIcon, MagicWandIcon, SmileyIcon,
    OpacityIcon, EditTextIcon, FontIcon, PaletteIcon, StrokeColorIcon, LineWidthIcon,
    AlignLeftIcon, AlignCenterIcon, AlignRightIcon, TextSpacingIcon, TextCurvatureIcon, TextBackgroundIcon, TextStrokeIcon, ShadowIcon,
    CropIcon, FiltersIcon, AdjustmentsIcon, ImageEffectsIcon, ImageDistortionIcon, EraseRestoreIcon,
    ShapeTypeIcon, CornerRadiusIcon, ShapeDistortionIcon
} from './components/icons';

// Interface for button definition
export interface ToolbarButtonConfig {
  tool: ToolOption;
  label: string;
  icon: React.FC<React.SVGProps<SVGSVGElement> & { className?: string }>;
}

export const defaultToolbarButtons: ToolbarButtonConfig[] = [
  { tool: ToolOption.ADD_TEXT, label: 'Texto', icon: TypeIcon },
  { tool: ToolOption.ADD_IMAGE, label: 'Imagem', icon: ImageIcon },
  { tool: ToolOption.ADD_SHAPE, label: 'Formas', icon: ShapesIcon },
  { tool: ToolOption.EFFECTS, label: 'Efeitos', icon: MagicWandIcon },
  { tool: ToolOption.STICKERS, label: 'Stickers', icon: SmileyIcon },
];

export const textToolbarButtons: ToolbarButtonConfig[] = [
  { tool: ToolOption.EDIT_OPACITY, label: 'Opacidade', icon: OpacityIcon },
  { tool: ToolOption.EDIT_TEXT_CONTENT, label: 'Editar', icon: EditTextIcon },
  { tool: ToolOption.EDIT_FONT_FAMILY, label: 'Fonte', icon: FontIcon }, // Placeholder action
  { tool: ToolOption.EDIT_TEXT_COLOR, label: 'Cor', icon: PaletteIcon }, // Placeholder action
  { tool: ToolOption.EDIT_TEXT_ALIGNMENT, label: 'Alinhar', icon: AlignCenterIcon }, // Placeholder action
  // Add more text tools here...
  // { tool: ToolOption.EDIT_TEXT_STROKE, label: 'Contorno T.', icon: TextStrokeIcon },
  // { tool: ToolOption.EDIT_TEXT_BACKGROUND, label: 'Fundo T.', icon: TextBackgroundIcon },
  // { tool: ToolOption.EDIT_TEXT_SHADOW, label: 'Sombra T.', icon: ShadowIcon },
];

export const imageToolbarButtons: ToolbarButtonConfig[] = [
  { tool: ToolOption.EDIT_OPACITY, label: 'Opacidade', icon: OpacityIcon },
  { tool: ToolOption.EDIT_IMAGE_CROP, label: 'Cortar', icon: CropIcon },
  { tool: ToolOption.EDIT_IMAGE_FILTERS, label: 'Filtros', icon: FiltersIcon }, // Placeholder action
  { tool: ToolOption.EDIT_IMAGE_ADJUSTMENTS, label: 'Ajustes', icon: AdjustmentsIcon }, // Placeholder action
  // { tool: ToolOption.EDIT_IMAGE_STROKE, label: 'Contorno Im.', icon: StrokeColorIcon },
  // { tool: ToolOption.EDIT_IMAGE_SHADOW, label: 'Sombra Im.', icon: ShadowIcon },
];

export const shapeToolbarButtons: ToolbarButtonConfig[] = [
  { tool: ToolOption.EDIT_OPACITY, label: 'Opacidade', icon: OpacityIcon },
  { tool: ToolOption.EDIT_SHAPE_FILL_COLOR, label: 'Preench.', icon: PaletteIcon }, // Placeholder action
  { tool: ToolOption.EDIT_SHAPE_STROKE_COLOR, label: 'Contorno', icon: StrokeColorIcon }, // Placeholder action
  { tool: ToolOption.EDIT_SHAPE_STROKE_WIDTH, label: 'L. Contorno', icon: LineWidthIcon }, // Placeholder action
  // For rectangles specifically, this would appear:
  // { tool: ToolOption.EDIT_SHAPE_CORNER_RADIUS, label: 'Cantos', icon: CornerRadiusIcon },
  // { tool: ToolOption.EDIT_SHAPE_TYPE, label: 'Mudar Forma', icon: ShapeTypeIcon },
];


export const getToolbarForElement = (element: DesignElement | null): ToolbarButtonConfig[] => {
    if (!element) {
        return defaultToolbarButtons;
    }
    switch (element.type) {
        case ToolOption.TEXT:
            return textToolbarButtons;
        case ToolOption.IMAGE:
            return imageToolbarButtons;
        case ToolOption.RECTANGLE:
            // Add CornerRadius tool specifically for rectangles
            const rectToolbar = [...shapeToolbarButtons];
            if (!rectToolbar.find(btn => btn.tool === ToolOption.EDIT_SHAPE_CORNER_RADIUS)) {
                rectToolbar.push({ tool: ToolOption.EDIT_SHAPE_CORNER_RADIUS, label: 'Cantos', icon: CornerRadiusIcon });
            }
            return rectToolbar;
        case ToolOption.CIRCLE:
            return shapeToolbarButtons; // Circles don't have corner radius
        default:
            return defaultToolbarButtons;
    }
};
