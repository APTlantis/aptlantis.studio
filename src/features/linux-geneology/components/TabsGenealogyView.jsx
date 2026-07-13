import React, { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown, ChevronRight } from "lucide-react";

/**
 * TabsGenealogyView - A component for displaying Linux genealogy data using tabs
 *
 * @param {Object} props
 * @param {Object} props.data - The JSON data to visualize
 * @returns {JSX.Element}
 */
const TabsGenealogyView = ({ data }) => {
  // State to track the current view path (for breadcrumb navigation)
  const [currentPath, setCurrentPath] = useState([]);
  const [currentNode, setCurrentNode] = useState(data);

  // Function to navigate to a specific node in the hierarchy
  const navigateTo = (path) => {
    let node = data;

    // Navigate through the path to find the target node
    for (let i = 0; i < path.length; i++) {
      const childName = path[i];
      const childNode = node.children.find((child) => child.name === childName);
      if (childNode) {
        node = childNode;
      } else {
        console.error(`Child node "${childName}" not found`);
        return;
      }
    }

    setCurrentPath(path);
    setCurrentNode(node);
  };

  // Function to navigate up one level
  const navigateUp = () => {
    if (currentPath.length === 0) return;

    const newPath = [...currentPath];
    newPath.pop();
    navigateTo(newPath);
  };

  // Function to navigate to a child node
  const navigateToChild = (childName) => {
    const newPath = [...currentPath, childName];
    navigateTo(newPath);
  };

  // Generate tabs based on the current node's children
  const generateTabs = () => {
    if (!currentNode.children || currentNode.children.length === 0) {
      return (
        <div className="p-4 text-white bg-gray-700 rounded">
          <p>This distribution has no child distributions.</p>
        </div>
      );
    }

    return (
      <Tabs.Root
        className="flex flex-col w-full"
        defaultValue={currentNode.children[0].name}
      >
        <Tabs.List className="flex border-b border-gray-600">
          {currentNode.children.map((child) => (
            <Tabs.Trigger
              key={child.name}
              value={child.name}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 data-[state=active]:text-white data-[state=active]:bg-gray-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
              style={{
                borderLeft: `4px solid ${child.color || "#888"}`,
                marginRight: "2px",
              }}
            >
              {child.name} ({child.year})
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {currentNode.children.map((child) => (
          <Tabs.Content
            key={child.name}
            value={child.name}
            className="p-4 bg-gray-800 rounded-b"
          >
            <DistributionDetails
              distribution={child}
              onNavigate={() => navigateToChild(child.name)}
            />
          </Tabs.Content>
        ))}
      </Tabs.Root>
    );
  };

  // Render breadcrumb navigation
  const renderBreadcrumbs = () => {
    const breadcrumbs = [
      { name: data.name, path: [] },
      ...currentPath.map((name, index) => ({
        name,
        path: currentPath.slice(0, index + 1),
      })),
    ];

    return (
      <div className="flex items-center mb-4 text-sm">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <ChevronRight className="mx-1 w-4 h-4 text-gray-400" />
            )}
            <button
              onClick={() => navigateTo(crumb.path)}
              className={`hover:underline ${
                index === breadcrumbs.length - 1
                  ? "font-semibold text-white"
                  : "text-gray-300"
              }`}
            >
              {crumb.name}
            </button>
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full p-4 overflow-auto">
      {/* Breadcrumb navigation */}
      {renderBreadcrumbs()}

      {/* Current distribution details */}
      <div className="mb-6">
        <DistributionDetails distribution={currentNode} isCurrentNode={true} />
      </div>

      {/* Navigation buttons */}
      {currentPath.length > 0 && (
        <button
          onClick={navigateUp}
          className="mb-4 px-3 py-1 bg-gray-700 text-white rounded flex items-center self-start hover:bg-gray-600"
        >
          <ChevronUp className="w-4 h-4 mr-1" />
          Up to{" "}
          {currentPath.length > 1
            ? currentPath[currentPath.length - 2]
            : data.name}
        </button>
      )}

      {/* Child distributions */}
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2 text-white">
          Child Distributions
        </h3>
        {generateTabs()}
      </div>
    </div>
  );
};

/**
 * DistributionDetails - A component for displaying details about a Linux distribution
 *
 * @param {Object} props
 * @param {Object} props.distribution - The distribution data
 * @param {boolean} props.isCurrentNode - Whether this is the current node being viewed
 * @param {Function} props.onNavigate - Function to navigate to this distribution
 * @returns {JSX.Element}
 */
const DistributionDetails = ({
  distribution,
  isCurrentNode = false,
  onNavigate,
}) => {
  const {
    name,
    year,
    color,
    tags = [],
    facts = [],
    philosophy = [],
    technical = {},
    plan = "",
    community = {},
    children = [],
  } = distribution;
  const hasChildren = children.length > 0;

  // Helper function to render object data
  const renderObjectData = (obj) => {
    return (
      <div className="space-y-2 text-sm">
        {Object.entries(obj).map(([key, value]) => (
          <div key={key} className="grid grid-cols-3 gap-2">
            <span className="font-semibold text-gray-300 capitalize col-span-1">
              {key.replace(/_/g, " ")}:
            </span>
            <div className="col-span-2">
              {Array.isArray(value) ? (
                <ul className="list-disc pl-5 space-y-1">
                  {value.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              ) : (
                <span>{value}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      className={`p-4 rounded-lg ${isCurrentNode ? "bg-gray-700" : "bg-gray-800"}`}
      style={{ borderLeft: `6px solid ${color || "#888"}` }}
    >
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-white">{name}</h2>
          {year && <p className="text-gray-300">Released: {year}</p>}
        </div>

        {!isCurrentNode && hasChildren && (
          <button
            onClick={onNavigate}
            className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-500 flex items-center"
          >
            View Children
            <ChevronRight className="ml-1 w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="mt-3">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-600 text-xs text-white rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Accordion group for all details */}
      <Accordion.Root type="multiple" className="mt-4 space-y-2">
        {/* Facts */}
        {facts.length > 0 && (
          <Accordion.Item value="facts">
            <Accordion.Trigger className="flex justify-between items-center w-full py-2 px-3 bg-gray-600 text-white rounded hover:bg-gray-500">
              <span>Facts</span>
              <ChevronDown className="w-4 h-4 transition-transform duration-200 ease-out data-[state=open]:rotate-180" />
            </Accordion.Trigger>
            <Accordion.Content className="pt-2 pb-4 px-3 bg-gray-600 text-white rounded-b data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp overflow-hidden">
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {facts.map((fact, index) => (
                  <li key={index}>{fact}</li>
                ))}
              </ul>
            </Accordion.Content>
          </Accordion.Item>
        )}

        {/* Philosophy */}
        {philosophy.length > 0 && (
          <Accordion.Item value="philosophy">
            <Accordion.Trigger className="flex justify-between items-center w-full py-2 px-3 bg-gray-600 text-white rounded hover:bg-gray-500">
              <span>Philosophy</span>
              <ChevronDown className="w-4 h-4 transition-transform duration-200 ease-out data-[state=open]:rotate-180" />
            </Accordion.Trigger>
            <Accordion.Content className="pt-2 pb-4 px-3 bg-gray-600 text-white rounded-b data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp overflow-hidden">
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {philosophy.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </Accordion.Content>
          </Accordion.Item>
        )}

        {/* Technical */}
        {Object.keys(technical).length > 0 && (
          <Accordion.Item value="technical">
            <Accordion.Trigger className="flex justify-between items-center w-full py-2 px-3 bg-gray-600 text-white rounded hover:bg-gray-500">
              <span>Technical</span>
              <ChevronDown className="w-4 h-4 transition-transform duration-200 ease-out data-[state=open]:rotate-180" />
            </Accordion.Trigger>
            <Accordion.Content className="pt-2 pb-4 px-3 bg-gray-600 text-white rounded-b data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp overflow-hidden">
              {renderObjectData(technical)}
            </Accordion.Content>
          </Accordion.Item>
        )}

        {/* Community */}
        {Object.keys(community).length > 0 && (
          <Accordion.Item value="community">
            <Accordion.Trigger className="flex justify-between items-center w-full py-2 px-3 bg-gray-600 text-white rounded hover:bg-gray-500">
              <span>Community</span>
              <ChevronDown className="w-4 h-4 transition-transform duration-200 ease-out data-[state=open]:rotate-180" />
            </Accordion.Trigger>
            <Accordion.Content className="pt-2 pb-4 px-3 bg-gray-600 text-white rounded-b data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp overflow-hidden">
              {renderObjectData(community)}
            </Accordion.Content>
          </Accordion.Item>
        )}

        {/* Plan */}
        {plan && (
          <Accordion.Item value="plan">
            <Accordion.Trigger className="flex justify-between items-center w-full py-2 px-3 bg-gray-600 text-white rounded hover:bg-gray-500">
              <span>Plan</span>
              <ChevronDown className="w-4 h-4 transition-transform duration-200 ease-out data-[state=open]:rotate-180" />
            </Accordion.Trigger>
            <Accordion.Content className="pt-2 pb-4 px-3 bg-gray-600 text-white rounded-b data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp overflow-hidden">
              <p className="text-sm italic">{plan}</p>
            </Accordion.Content>
          </Accordion.Item>
        )}
      </Accordion.Root>
    </div>
  );
};

// ChevronUp icon component
const ChevronUp = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polyline points="18 15 12 9 6 15"></polyline>
  </svg>
);

export default TabsGenealogyView;
