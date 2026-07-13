import { hierarchy, tree } from "d3-hierarchy";

/**
 * Process JSON data into ReactFlow nodes and edges
 *
 * @param {Object} jsonData - The hierarchical JSON data
 * @param {Object} schemaMap - Configuration for node styling and behavior
 * @param {Object} expandedNodes - Map of node IDs to their expanded state
 * @returns {Object} - Object containing nodes and edges arrays for ReactFlow
 */
export const processJsonToNodesAndEdges = (
  jsonData,
  schemaMap,
  expandedNodes,
) => {
  // Create a d3 hierarchy from the JSON data
  const root = hierarchy(jsonData);

  // Create a tree layout with increased spacing for better visibility
  const treeLayout = tree()
    .nodeSize([200, 120]) // Increased node spacing
    .separation(() => 1.8); // Increased separation

  // Apply the layout
  const rootWithLayout = treeLayout(root);

  // Process nodes and edges
  const nodes = [];
  const edges = [];

  // Helper function to process a node and its children
  const processNode = (node, parentId = null, path = "", depth = 0) => {
    const nodeId = path ? `${path}-${node.data.name}` : node.data.name;

    // For root node or explicitly expanded nodes, show children
    // This ensures we don't hide nodes that should be visible
    const isRoot = depth === 0;
    const isExplicitlyExpanded = expandedNodes[nodeId] === true;
    const shouldShowChildren = isRoot || isExplicitlyExpanded;

    console.log(
      `Processing node: ${node.data.name}, ID: ${nodeId}, Depth: ${depth}, Expanded: ${shouldShowChildren}`,
    );

    // Create the node
    const reactFlowNode = createNode(node, nodeId, schemaMap, expandedNodes);
    nodes.push(reactFlowNode);

    // Create edge from parent if it exists
    if (parentId) {
      edges.push({
        id: `e-${parentId}-${nodeId}`,
        source: parentId,
        target: nodeId,
        type: "smoothstep",
        animated: false,
        style: { stroke: "#555" },
      });
    }

    // Process children if this node is expanded or is the root
    if (shouldShowChildren && node.children) {
      console.log(
        `Processing ${node.children.length} children of ${node.data.name}`,
      );
      node.children.forEach((child) => {
        processNode(child, nodeId, nodeId, depth + 1);
      });
    }
  };

  // Start processing from the root
  processNode(rootWithLayout);

  return { nodes, edges };
};

/**
 * Create a ReactFlow node from a d3 hierarchy node
 *
 * @param {Object} node - d3 hierarchy node
 * @param {string} nodeId - Unique ID for the node
 * @param {Object} schemaMap - Configuration for node styling
 * @param {Object} expandedNodes - Map of node IDs to their expanded state
 * @returns {Object} - ReactFlow node
 */
const createNode = (node, nodeId, schemaMap, expandedNodes = {}) => {
  const { data } = node;
  const { defaultNodeStyle = {}, colorMap = {} } = schemaMap;

  // Determine node color based on schema map or use the color from the data
  const nodeColor = colorMap[data.name] || data.color || "#888";

  // Create node label with additional information
  const nodeLabel = createNodeLabel(data);

  // Determine if the node has children
  const hasChildren = node.children && node.children.length > 0;

  // Create the node
  // Calculate position with better spacing
  const xPos = node.x * 250; // Increased horizontal spacing
  const yPos = node.y * 180; // Increased vertical spacing

  console.log(`Node ${node.data.name} positioned at x: ${xPos}, y: ${yPos}`);

  // Calculate appropriate node width based on content
  const hasFacts = facts && facts.length > 0;
  const hasLongName = name && name.length > 15;
  const hasManyTags = tags && tags.length > 2;

  // Determine appropriate width
  let nodeWidth = 180; // Base width
  if (hasLongName) nodeWidth = Math.max(nodeWidth, 220);
  if (hasManyTags) nodeWidth = Math.max(nodeWidth, 240);
  if (hasFacts) nodeWidth = Math.max(nodeWidth, 280);

  return {
    id: nodeId,
    position: { x: xPos, y: yPos },
    data: {
      label: (
        <>
          {nodeLabel}
          {/* Add an explicit expand/collapse indicator for nodes with children */}
          {hasChildren && (
            <div
              className="expand-collapse-button"
              style={{
                position: "absolute",
                bottom: "-12px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "28px", // Slightly larger
                height: "28px", // Slightly larger
                borderRadius: "50%",
                background: nodeColor,
                border: "2px solid white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px", // Larger font
                fontWeight: "bold",
                color: getContrastColor(nodeColor),
                cursor: "pointer",
                boxShadow: "0 3px 6px rgba(0, 0, 0, 0.4)", // Enhanced shadow
                zIndex: 10, // Ensure button is above other elements
                userSelect: "none", // Prevent text selection
              }}
              onClick={(e) => {
                e.stopPropagation(); // Prevent event from bubbling up to the node
                // The actual toggle happens in the onNodeClick handler in JsonNodeTree
              }}
            >
              {expandedNodes[nodeId] === true ? "−" : "+"}
            </div>
          )}
        </>
      ),
      originalData: data,
      hasChildren,
      nodeId, // Pass nodeId to make it accessible in event handlers
    },
    style: {
      background: nodeColor,
      color: getContrastColor(nodeColor),
      borderRadius: defaultNodeStyle.borderRadius || 8,
      padding: defaultNodeStyle.padding || 12, // Slightly more padding
      border: defaultNodeStyle.border || "1px solid #333",
      width: nodeWidth, // Dynamic width based on content
      minWidth: 180,
      maxWidth: 320, // Maximum width to prevent overly wide nodes
      textAlign: "center",
      // Add a visual indicator for expandable nodes
      boxShadow: hasChildren
        ? `0 0 12px rgba(255, 255, 255, 0.4), 0 0 0 1px ${nodeColor}`
        : `0 0 0 1px ${nodeColor}`,
      position: "relative", // Needed for absolute positioning of the indicator
      transition: "all 0.2s ease", // Smooth transition for visual changes
    },
    // Add a class to identify nodes with children for potential CSS targeting
    className: hasChildren ? "node-with-children" : "leaf-node",
  };
};

/**
 * Create a formatted label for a node
 *
 * @param {Object} data - Node data from the JSON
 * @returns {JSX.Element} - Formatted label
 */
const createNodeLabel = (data) => {
  // Ensure we have default values for all properties
  const { name = "Unknown", year, tags = [], facts = [], color } = data;

  // Log the data being processed for debugging
  console.log(`Creating label for node: ${name}`, data);

  return (
    <>
      {/* Distribution name - make it more prominent */}
      <div
        style={{
          fontWeight: "bold",
          fontSize: "1.1em",
          padding: "2px 0",
          borderBottom: "1px solid rgba(255,255,255,0.2)",
          marginBottom: "4px",
        }}
      >
        {name}
      </div>

      {/* Year - if available */}
      {year && (
        <div
          style={{
            fontSize: "0.9em",
            fontWeight: "500",
            marginBottom: "4px",
          }}
        >
          {year}
        </div>
      )}

      {/* Tags - if available */}
      {tags && tags.length > 0 && (
        <div
          style={{
            fontSize: "0.75em",
            marginTop: "4px",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "4px",
          }}
        >
          {tags.map((tag, i) => (
            <span
              key={i}
              style={{
                background: "rgba(255,255,255,0.2)",
                padding: "2px 6px",
                borderRadius: "12px",
                display: "inline-block",
                whiteSpace: "nowrap",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Facts - if available */}
      {facts && facts.length > 0 && (
        <div
          style={{
            fontSize: "0.75em",
            marginTop: "8px",
            textAlign: "left",
            maxWidth: "250px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              fontStyle: "italic",
              marginBottom: "4px",
              opacity: 0.9,
              borderBottom: "1px dotted rgba(255,255,255,0.3)",
              paddingBottom: "2px",
            }}
          >
            Facts:
          </div>
          <ul
            style={{
              margin: "0",
              padding: "0 0 0 16px",
              listStyleType: "disc",
              maxHeight: "80px",
              overflowY: "auto",
            }}
          >
            {facts.map((fact, i) => (
              <li
                key={i}
                style={{
                  marginBottom: "4px",
                  lineHeight: "1.2",
                }}
              >
                {fact}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

/**
 * Get a contrasting text color (black or white) based on background color
 *
 * @param {string} bgColor - Background color in hex format
 * @returns {string} - Contrasting text color (black or white)
 */
const getContrastColor = (bgColor) => {
  // Remove the # if it exists
  const color = bgColor.charAt(0) === "#" ? bgColor.substring(1) : bgColor;

  // Convert to RGB
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black for light colors and white for dark colors
  return luminance > 0.5 ? "#000000" : "#ffffff";
};
