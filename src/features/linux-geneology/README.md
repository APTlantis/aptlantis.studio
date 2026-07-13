# Linux Genealogy Visualization

This feature provides an interactive way to explore the relationships and history of Linux distributions.

## Overview

The Linux Genealogy Visualization displays hierarchical data about Linux distributions, including:

- Distribution names and release years
- Color-coded visual identifiers
- Tags describing key characteristics
- Interesting facts about each distribution
- Parent-child relationships between distributions

## Distribution Coverage

The genealogy includes a comprehensive collection of Linux distributions:

- **Major Base Distributions**: Linux Kernel, Debian, Red Hat, Slackware, SUSE, Arch, Gentoo, Alpine, NixOS, Solus, Clear Linux
- **Popular Derivatives**: Ubuntu, Fedora, CentOS, openSUSE, Manjaro, Linux Mint, Feren OS, and many more
- **Specialized Distributions**:
  - Security-focused: Kali Linux
  - Container-optimized: Alpine Linux, Clear Linux
  - Mobile: postmarketOS
  - Lightweight: MX Linux
  - Enterprise: RHEL, SUSE Linux Enterprise
  - Beginner-friendly: Zorin OS, Pop!\_OS, Feren OS
  - Customizable: Gentoo, Arch Linux, Solus
  - Declarative: NixOS
  - Performance-optimized: Clear Linux
  - Windows-like experience: Feren OS, Zorin OS

Each distribution includes detailed information about its:

- Origin and development history
- Technical characteristics and innovations
- Philosophical approach to Linux
- Relationship to other distributions
- Target audience and use cases

## Components

### TabsGenealogyView

The main component that displays the Linux genealogy data using a tabbed interface. It provides:

- Breadcrumb navigation to show the current path in the hierarchy
- Detailed view of the current distribution
- Tabbed interface to navigate between child distributions
- Navigation buttons to move up and down the hierarchy

### DistributionDetails

A sub-component that displays details about a specific Linux distribution, including:

- Name and release year
- Color-coded visual identifier
- Tags displayed as badges
- Multiple expandable accordions for detailed information:
  - Facts: Interesting facts about the distribution
  - Philosophy: The distribution's guiding principles and approach
  - Technical: Technical specifications and features
  - Community: Community resources and information
  - Plan: The distribution's mission statement or vision
- Navigation button to view child distributions (if any)

## How to Use

1. **Navigating the Hierarchy**:
   - Use the tabs to switch between different distributions at the same level
   - Click the "View Children" button to navigate to a distribution's children
   - Use the breadcrumb navigation at the top to see your current location and navigate back
   - Click the "Up to [parent]" button to navigate up one level

2. **Viewing Distribution Details**:
   - Each distribution shows its name, year, and tags by default
   - Click on any of the accordions to expand and view detailed information:
     - **Facts**: Interesting facts about the distribution
     - **Philosophy**: The distribution's guiding principles and approach
     - **Technical**: Technical specifications and features
     - **Community**: Community resources and information
     - **Plan**: The distribution's mission statement or vision
   - Multiple accordions can be open simultaneously for easy comparison
   - The color bar on the left of each distribution corresponds to the color in the legend

3. **Color Legend**:
   - The color legend at the top of the page shows the color associated with each distribution
   - These colors are used in the left border of each distribution card for quick visual identification

## Data Structure

The visualization uses a JSON data structure with the following format:

```json
{
  "name": "Distribution Name",
  "year": 2000,
  "color": "#HEXCOLOR",
  "tags": ["tag1", "tag2"],
  "facts": ["Fact 1", "Fact 2"],
  "philosophy": ["Guiding principle 1", "Guiding principle 2"],
  "technical": {
    "package_manager": "apt/dnf/pacman",
    "init": "systemd/OpenRC",
    "arch": ["x86_64", "ARM"],
    "release_model": "rolling/LTS"
  },
  "community": {
    "website": "https://example.org",
    "forum": "https://forum.example.org",
    "irc": "#channel @ network",
    "governance": "Community-led/Corporate"
  },
  "plan": "Mission statement or vision for the distribution",
  "children": [
    {
      "name": "Child Distribution",
      "year": 2010,
      "color": "#ANOTHERCOLOR",
      "tags": ["tag3", "tag4"],
      "facts": ["Child Fact 1", "Child Fact 2"],
      "philosophy": ["Child philosophy"],
      "technical": {
        "package_manager": "inherited",
        "desktop": "GNOME/KDE/Xfce"
      },
      "plan": "Child distribution's mission",
      "children": []
    }
  ]
}
```

## Implementation Notes

- Uses Radix UI components (Tabs, Accordion) for accessible UI elements
- Implements a breadcrumb navigation system for easy traversal of the hierarchy
- Uses Tailwind CSS for styling
- Handles edge cases like distributions with no children
