// Material Icons Updater Plugin

interface MaterialSymbolsParams {
  style: string; // materialsymbolsoutlined, materialsymbolsrounded, materialsymbolssharp
  weight: number; // 100-700
  size: number; // 20-48
  grade: number; // -25, 0, 200
  fill: boolean; // true/false
}

// Default parameters
const DEFAULT_PARAMS: MaterialSymbolsParams = {
  style: 'materialsymbolsoutlined',
  weight: 400,
  size: 24,
  grade: 0,
  fill: false
};

interface NodeInfo {
  id: string;
  name: string;
  type: 'COMPONENT' | 'FRAME';
  iconName: string | null;
}

// Show the plugin UI with initial size
figma.showUI(__html__, { width: 320, height: 480 });

// Track current selection and current parameters
let currentSelection: NodeInfo[] = [];
let currentParams: MaterialSymbolsParams = { ...DEFAULT_PARAMS };

// Settings persistence using clientStorage
const SETTINGS_KEY = 'material-symbols-settings';

// Load saved settings on startup
async function loadSettings(): Promise<MaterialSymbolsParams> {
  try {
    const saved = await figma.clientStorage.getAsync(SETTINGS_KEY);
    if (saved) {
      return { ...DEFAULT_PARAMS, ...saved };
    }
  } catch (error) {
    console.warn('Failed to load settings:', error);
  }
  return { ...DEFAULT_PARAMS };
}

// Save settings to clientStorage
async function saveSettings(params: MaterialSymbolsParams): Promise<void> {
  try {
    await figma.clientStorage.setAsync(SETTINGS_KEY, params);
  } catch (error) {
    console.warn('Failed to save settings:', error);
  }
}

// Handle messages from UI
figma.ui.onmessage = async (message) => {
  switch (message.type) {
    case 'get-selection':
      updateSelection();
      break;
      
    case 'update-icons':
      // Update current parameters and save them
      currentParams = { ...message.parameters };
      await saveSettings(currentParams);
      await updateIcons(message.parameters, message.nodes);
      break;
      
    case 'resize':
      // Resize the plugin window
      figma.ui.resize(message.width, message.height);
      break;
  }
};

// Listen for selection changes
figma.on('selectionchange', () => {
  updateSelection();
});

// Update current selection and send to UI
function updateSelection() {
  const selection = figma.currentPage.selection;
  currentSelection = [];
  let hasUnsupportedNodes = false;
  
  for (const node of selection) {
    if (node.type === 'COMPONENT' || node.type === 'FRAME') {
      const iconName = extractIconName(node);
      currentSelection.push({
        id: node.id,
        name: node.name,
        type: node.type,
        iconName: iconName
      });
    } else if (selection.length > 0) {
      // Track if there are unsupported node types in selection
      hasUnsupportedNodes = true;
    }
  }
  
  figma.ui.postMessage({
    type: 'selection-changed',
    nodes: currentSelection,
    hasUnsupportedNodes: hasUnsupportedNodes
  });
}

// Extract icon name from node name
function extractIconName(node: ComponentNode | FrameNode): string | null {
  // Use the component name directly as the icon name
  // Expected format: "sync_disabled", "error_outlined", etc.
  const name = node.name.toLowerCase();
  
  // Basic validation - should be a reasonable icon name (letters, numbers, underscores)
  if (name.length > 0 && /^[a-z0-9_]+$/.test(name)) {
    return name;
  }
  
  return null;
}

// Main function to update icons
async function updateIcons(params: MaterialSymbolsParams, nodes: NodeInfo[]) {
  try {
    const total = nodes.length;
    let updateCount = 0;
    
    figma.ui.postMessage({
      type: 'update-progress',
      message: 'Starting icon updates...',
      current: 0,
      total: total
    });
    
    for (let i = 0; i < nodes.length; i++) {
      const nodeInfo = nodes[i];
      if (!nodeInfo.iconName) {
        console.warn(`Skipping ${nodeInfo.name}: could not extract icon name`);
        continue;
      }
      
      try {
        figma.ui.postMessage({
          type: 'update-progress',
          message: `Updating ${nodeInfo.name}...`,
          current: i,
          total: total
        });
        
        const node = await figma.getNodeByIdAsync(nodeInfo.id) as ComponentNode | FrameNode;
        if (!node) {
          console.warn(`Node ${nodeInfo.id} not found`);
          continue;
        }
        
        // Fetch SVG from Material Symbols API
        const svgContent = await fetchMaterialSymbol(nodeInfo.iconName, params);
        
        if (svgContent) {
          // Replace node content with new SVG
          await replaceNodeContent(node, svgContent);
          updateCount++;
          
          // Send progress update after successful update
          figma.ui.postMessage({
            type: 'update-progress',
            message: `Updated ${nodeInfo.name}`,
            current: i + 1,
            total: total
          });
        } else {
          console.warn(`Could not fetch icon: ${nodeInfo.iconName}`);
        }
        
      } catch (error) {
        console.error(`Error updating ${nodeInfo.name}:`, error);
      }
    }
    
    figma.ui.postMessage({
      type: 'update-complete',
      count: updateCount
    });
    
  } catch (error) {
    figma.ui.postMessage({
      type: 'update-error',
      error: `Update failed: ${error instanceof Error ? error.message : String(error)}`
    });
  }
}

// Fetch Material Symbol SVG from Google API
async function fetchMaterialSymbol(iconName: string, params: MaterialSymbolsParams): Promise<string | null> {
  try {
    const url = buildIconUrl(iconName, params);
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Failed to fetch ${iconName}: ${response.status}`);
      return null;
    }
    
    const svgContent = await response.text();
    return svgContent;
    
  } catch (error) {
    console.error(`Error fetching ${iconName}:`, error);
    return null;
  }
}

// Build Material Symbols API URL
function buildIconUrl(iconName: string, params: MaterialSymbolsParams): string {
  const { style, weight, size, grade, fill } = params;
  
  // GitHub raw files URL pattern for Material Symbols
  const baseUrl = 'https://raw.githubusercontent.com/google/material-design-icons/master/symbols/web';
  
  // Build filename: iconName[_wght{weight}][_grad{grade}][fill1]_{size}px.svg
  // Note: weight 400 and grade 0 are omitted (defaults)
  let filename = iconName;
  if (weight !== 400) {
    filename += `_wght${weight}`;
  }
  if (grade !== 0) {
    // Handle negative grade values (N25 for -25)
    const gradeParam = grade < 0 ? `gradN${Math.abs(grade)}` : `grad${grade}`;
    filename += `_${gradeParam}`;
  }
  if (fill) {
    filename += 'fill1';
  }
  filename += `_${size}px.svg`;
  
  return `${baseUrl}/${iconName}/${style}/${filename}`;
}

// Replace node content with new SVG
async function replaceNodeContent(node: ComponentNode | FrameNode, svgContent: string): Promise<void> {
  try {
    // Parse SVG and create Figma nodes
    const svgNode = figma.createNodeFromSvg(svgContent);
    
    if (!svgNode) {
      throw new Error('Failed to create node from SVG');
    }
    
    // Clear existing content
    if (node.type === 'COMPONENT' || node.type === 'FRAME') {
      // Remove all children
      for (const child of [...node.children]) {
        child.remove();
      }
      
      // Add new SVG content
      if ('children' in svgNode && svgNode.children) {
        // If SVG created a group/frame, add all its children
        for (const child of [...svgNode.children]) {
          node.appendChild(child);
        }
        svgNode.remove();
      } else {
        // Add single node
        node.appendChild(svgNode);
      }
    }
    
  } catch (error) {
    console.error('Error replacing node content:', error);
    throw error;
  }
}

// Initialize plugin
async function initializePlugin() {
  // Load saved settings
  currentParams = await loadSettings();
  
  // Send loaded parameters to UI
  figma.ui.postMessage({
    type: 'settings-loaded',
    parameters: currentParams
  });
  
  // Send initial selection to UI
  updateSelection();
}

// Initialize
initializePlugin();
