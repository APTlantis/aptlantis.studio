import React, { useCallback, useEffect, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import { useTreeStore } from "./useTreeStore";
import { processJsonToNodesAndEdges } from "./treeUtils.jsx";

/**
 * JsonNodeTree - A component for visualizing hierarchical JSON data as an interactive tree
 *
 * @param {Object} props
 * @param {Object} props.data - The JSON data to visualize
 * @param {Object} props.schemaMap - Configuration for node styling and behavior
 * @param {Object} props.options - Additional options for the tree visualization
 * @returns {JSX.Element}
 */
const JsonNodeTree = ({
  data,
  schemaMap = {
    nodeTypes: {},
    colorMap: {},
    defaultNodeStyle: {
      borderRadius: 8,
      padding: 10,
      border: "1px solid #333",
    },
  },
  options = {
    showMiniMap: true,
    showControls: true,
    darkMode: true,
    nodePadding: 50,
  },
  treeActionCount = 0,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { expandedNodes, toggleNodeExpansion, initializeExpandedState } =
    useTreeStore();

  // Local state to track changes to expandedNodes
  const [expandedNodesVersion, setExpandedNodesVersion] = useState(0);

  // Process the JSON data into nodes and edges
  useEffect(() => {
    if (data) {
      console.log("Processing JSON data into nodes and edges");
      console.log("Current expandedNodes state:", expandedNodes);
      console.log("expandedNodesVersion:", expandedNodesVersion);
      console.log("treeActionCount:", treeActionCount);

      try {
        // Deep clone the data to ensure we're working with a fresh copy
        const clonedData = JSON.parse(JSON.stringify(data));

        const { nodes: processedNodes, edges: processedEdges } =
          processJsonToNodesAndEdges(clonedData, schemaMap, expandedNodes);

        console.log(
          `Processed ${processedNodes.length} nodes and ${processedEdges.length} edges`,
        );

        if (processedNodes.length > 0) {
          setNodes(processedNodes);
          setEdges(processedEdges);
        } else {
          console.error("No nodes were processed from the JSON data");
        }
      } catch (error) {
        console.error("Error processing JSON data:", error);
      }

      // Initialize expanded state if not already done
      if (Object.keys(expandedNodes).length === 0) {
        console.log("Initializing expanded state");
        initializeExpandedState(data);
      }
    }
  }, [
    data,
    schemaMap,
    expandedNodes,
    expandedNodesVersion,
    treeActionCount,
    setNodes,
    setEdges,
    initializeExpandedState,
  ]);

  // Handle node click for expansion/collapse
  const onNodeClick = useCallback(
    (event, node) => {
      console.log("Node clicked:", node.id);

      // Check if the click was on the expand/collapse button
      const isExpandCollapseButton = event.target.closest(
        ".expand-collapse-button",
      );

      // If it's a button click or if the node has children, toggle expansion
      if (isExpandCollapseButton || (node.data && node.data.hasChildren)) {
        console.log("Toggling expansion for node:", node.id);
        toggleNodeExpansion(node.id);
        // Increment version to force re-render
        setExpandedNodesVersion((prev) => prev + 1);

        // Prevent default behavior and stop propagation
        event.preventDefault();
        event.stopPropagation();
      } else {
        console.log("Node has no children, not toggling expansion");
      }
    },
    [toggleNodeExpansion, setExpandedNodesVersion],
  );

  return (
    <div style={{ width: "100%", height: "100%", minHeight: "500px" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        fitView
        attributionPosition="bottom-left"
      >
        {options.showMiniMap && <MiniMap />}
        {options.showControls && <Controls />}
        <Background
          gap={16}
          color={options.darkMode ? "#333" : "#ddd"}
          style={{ background: options.darkMode ? "#121212" : "#f8f8f8" }}
        />
      </ReactFlow>
    </div>
  );
};

export default JsonNodeTree;
