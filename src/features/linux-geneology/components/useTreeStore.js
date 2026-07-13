import { create } from "zustand";

/**
 * Zustand store for managing the tree state
 * Handles the expanded/collapsed state of nodes
 */
export const useTreeStore = create((set, get) => ({
  // Map of node IDs to their expanded state (true = expanded, false = collapsed)
  expandedNodes: {},

  // Toggle the expansion state of a node
  toggleNodeExpansion: (nodeId) => {
    set((state) => {
      // Get current state, defaulting to false if undefined
      const currentExpanded = state.expandedNodes[nodeId] === true;
      console.log(
        `Toggling node ${nodeId}: ${currentExpanded} -> ${!currentExpanded}`,
      );

      return {
        expandedNodes: {
          ...state.expandedNodes,
          [nodeId]: !currentExpanded,
        },
      };
    });
  },

  // Set a specific expansion state for a node
  setNodeExpansion: (nodeId, isExpanded) => {
    set((state) => ({
      expandedNodes: {
        ...state.expandedNodes,
        [nodeId]: isExpanded,
      },
    }));
  },

  // Initialize the expanded state based on the JSON data
  // By default, only the root node is expanded
  initializeExpandedState: (data) => {
    const expandedNodes = {};

    // Helper function to recursively process nodes
    const processNode = (node, path = "", depth = 0) => {
      const nodeId = path ? `${path}-${node.name}` : node.name;

      // Only expand the root node by default, collapse all others
      expandedNodes[nodeId] = depth === 0;

      console.log(
        `Initializing node: ${node.name}, ID: ${nodeId}, Depth: ${depth}, Expanded: ${expandedNodes[nodeId]}`,
      );

      // Process children if they exist
      if (node.children && Array.isArray(node.children)) {
        node.children.forEach((child) => {
          processNode(child, nodeId, depth + 1);
        });
      }
    };

    // Start processing from the root
    processNode(data);

    console.log("Initialized expanded state:", expandedNodes);

    // Update the store
    set({ expandedNodes });
  },

  // Expand all nodes
  expandAll: () => {
    const { expandedNodes } = get();
    const newExpandedNodes = { ...expandedNodes };

    console.log("Expanding all nodes");

    Object.keys(newExpandedNodes).forEach((nodeId) => {
      newExpandedNodes[nodeId] = true;
    });

    console.log("All nodes expanded:", Object.keys(newExpandedNodes).length);

    set({ expandedNodes: newExpandedNodes });
  },

  // Collapse all nodes except the root
  collapseAll: () => {
    const { expandedNodes } = get();
    const newExpandedNodes = { ...expandedNodes };

    console.log("Collapsing all nodes except root");

    Object.keys(newExpandedNodes).forEach((nodeId) => {
      // If it contains a hyphen, it's not the root node
      const isRoot = !nodeId.includes("-");
      newExpandedNodes[nodeId] = isRoot;

      if (isRoot) {
        console.log(`Keeping root node expanded: ${nodeId}`);
      }
    });

    console.log("All nodes collapsed except root");

    set({ expandedNodes: newExpandedNodes });
  },
}));
