import React, { useEffect, useState } from "react";
import MetaTags from "../../../components/MetaTags";
import TabsGenealogyView from "../components/TabsGenealogyView";
import D3TreeVisualization from "../components/D3TreeVisualization";
import linuxGenealogyData from "../data/linux-geneology.json";

const LinuxGenealogyPage = () => {
  const [data, setData] = useState(null);
  const [viewMode, setViewMode] = useState("graph");

  useEffect(() => {
    setData(linuxGenealogyData);
  }, []);

  const generateColorLegend = () => {
    if (!data) return [];
    const legendItems = [];
    const processNode = (node) => {
      if (node.name && node.color) {
        legendItems.push({ name: node.name, color: node.color });
      }
      if (node.children && Array.isArray(node.children)) {
        node.children.forEach(processNode);
      }
    };
    processNode(data);
    return legendItems;
  };

  const colorLegend = generateColorLegend();

  return (
    <div className="flex flex-col h-screen">
      <MetaTags
        title="Linux Distribution Genealogy | APTlantis"
        description="An interactive exploration of Linux distribution relationships and history."
        canonicalUrl="https://aptlantis.net/linux-geneology"
        ogTitle="Linux Distribution Genealogy"
        ogDescription="Explore the lineage and relationships of Linux distributions on APTlantis."
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "@id": "https://aptlantis.net/linux-geneology",
            name: "Linux Distribution Genealogy",
            description:
              "Interactive timeline visualization of Linux distribution relationships from 1991-2020+",
            url: "https://aptlantis.net/linux-geneology",
            inLanguage: "en-US",
            isPartOf: {
              "@type": "WebSite",
              name: "Aptlantis",
              url: "https://aptlantis.net",
            },
            about: {
              "@type": "Dataset",
              "@id": "https://aptlantis.net/data/linux-geneology.json",
              name: "Linux Distribution Genealogy Dataset",
              description:
                "Hierarchical genealogical data for major Linux distributions spanning 1991-2020+",
              license: "https://creativecommons.org/publicdomain/zero/1.0/",
              keywords: [
                "Linux",
                "Distribution",
                "Genealogy",
                "Open Source",
                "Timeline",
                "Unix",
                "History",
              ],
              creator: {
                "@type": "Organization",
                name: "Aptlantis",
              },
              distribution: {
                "@type": "DataDownload",
                contentUrl: "https://aptlantis.net/data/linux-geneology.json",
                encodingFormat: "application/json",
              },
            },
            mainEntity: {
              "@type": "VisualArtwork",
              name: "Linux Distribution Timeline Visualization",
              description:
                "D3.js interactive tree showing distribution lineage over time with color-coded nodes and relationship lines",
              artMedium: "Interactive D3.js Visualization",
              artform: "Digital Interactive",
              creator: {
                "@type": "Organization",
                name: "Aptlantis",
              },
            },
            breadcrumb: {
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: "https://aptlantis.net/",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Linux Genealogy",
                },
              ],
            },
          },
        ]}
      />
      <div className="bg-gray-800 text-white p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold">Linux Distribution Genealogy</h1>
            <p className="text-sm mt-1">
              An interactive exploration of Linux distribution relationships and
              history
            </p>
          </div>
          <div className="flex gap-2 bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode("graph")}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${viewMode === "graph" ? "bg-blue-600 text-white" : "text-gray-300 hover:text-white"}`}
            >
              Graph View
            </button>
            <button
              onClick={() => setViewMode("tabs")}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${viewMode === "tabs" ? "bg-blue-600 text-white" : "text-gray-300 hover:text-white"}`}
            >
              Tabs View
            </button>
          </div>
        </div>
        {viewMode === "tabs" && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold mb-2">Color Legend</h2>
            <div className="flex flex-wrap gap-2">
              {colorLegend.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className="w-4 h-4 mr-1 rounded"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="flex-grow bg-gray-900 overflow-hidden">
        {data ? (
          viewMode === "graph" ? (
            <D3TreeVisualization data={data} />
          ) : (
            <TabsGenealogyView data={data} />
          )
        ) : (
          <div className="flex items-center justify-center h-full text-white">
            Loading...
          </div>
        )}
      </div>
      {viewMode === "tabs" && (
        <div className="bg-gray-800 text-white p-4 text-sm">
          <h3 className="font-semibold mb-2">How to use this visualization:</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Use the <span className="font-semibold">tabs</span> to navigate
              between different Linux distributions
            </li>
            <li>
              Click on <span className="font-semibold">View Children</span> to
              explore child distributions
            </li>
            <li>
              Use the{" "}
              <span className="font-semibold">breadcrumb navigation</span> at
              the top to see your current location and navigate back
            </li>
            <li>
              Click on <span className="font-semibold">Facts</span> to expand
              and view interesting facts about each distribution
            </li>
            <li>
              The color bar on the left of each distribution corresponds to the
              color in the legend above
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default LinuxGenealogyPage;
