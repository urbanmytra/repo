// src/data/serviceHierarchy.js
import { 
  FiWind, 
  FiZap, 
  FiDroplet, 
  FiHome, 
  FiShield, 
  FiTruck,
  FiTool,
  FiSettings,
  FiGrid,
  FiSun,
  FiShoppingBag,
  FiPackage,
  FiCpu,
  FiUsers,
  FiLayers
} from 'react-icons/fi';

export const serviceHierarchy = {
  // 1. AC Services
  'AC Services': {
    icon: FiWind,
    color: '#06b6d4',
    image: 'https://images.unsplash.com/photo-1631545967298-c7368e12e0b4',
    subCategories: {
      'Split': {
        icon: FiWind,
        services: [
          'Split AC Service',
          'Split AC Installation',
          'Split AC Uninstallation',
          'Split AC Gas Refilling (Full)',
          'Split AC Gas Refilling (Top-up)',
          'Split AC Gas Pumpdown Service'
        ]
      },
      'Window': {
        icon: FiWind,
        services: [
          'Window AC Service',
          'Window AC Installation',
          'Window AC Uninstallation',
          'Window AC Gas Refilling (Full)',
          'Window AC Gas Refilling (Top-up)',
          'Window AC Gas Pumpdown Service'
        ]
      },
      'Commercial': {
        icon: FiWind,
        services: [
          'Commercial AC Service',
          'Commercial AC Installation',
          'Commercial AC Uninstallation',
          'Commercial AC Gas Refilling (Full)',
          'Commercial AC Gas Refilling (Top-up)',
          'Commercial AC Gas Pumpdown Service'
        ]
      },
      'Cassette': {
        icon: FiWind,
        services: [
          'Cassette AC Service',
          'Cassette AC Installation',
          'Cassette AC Uninstallation',
          'Cassette AC Gas Refilling (Full)',
          'Cassette AC Gas Refilling (Top-up)',
          'Cassette AC Gas Pumpdown Service'
        ]
      },
      'Ductable AC': {
        icon: FiWind,
        services: [
          'Ductable AC Service',
          'Ductable AC Installation',
          'Ductable AC Uninstallation',
          'Ductable AC Gas Refilling (Full)',
          'Ductable AC Gas Refilling (Top-up)',
          'Ductable AC Gas Pumpdown Service'
        ]
      },
      'Tower AC': {
        icon: FiWind,
        services: [
          'Tower AC Service',
          'Tower AC Installation',
          'Tower AC Uninstallation',
          'Tower AC Gas Refilling (Full)',
          'Tower AC Gas Refilling (Top-up)',
          'Tower AC Gas Pumpdown Service'
        ]
      },
      'Furstand AC': {
        icon: FiWind,
        services: [
          'Furstand AC Service',
          'Furstand AC Installation',
          'Furstand AC Uninstallation',
          'Furstand AC Gas Refilling (Full)',
          'Furstand AC Gas Refilling (Top-up)',
          'Furstand AC Gas Pumpdown Service'
        ]
      },
      'VRF AC': {
        icon: FiWind,
        services: [
          'VRF AC Service',
          'VRF AC Installation',
          'VRF AC Uninstallation',
          'VRF AC Gas Refilling (Full)',
          'VRF AC Gas Refilling (Top-up)',
          'VRF AC Gas Pumpdown Service'
        ]
      }
    }
  },

  // 2. Appliances
  'Appliances': {
    icon: FiHome,
    color: '#10b981',
    image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba',
    subCategories: {
      'All Types': {
        icon: FiHome,
        services: [
          'Refrigerator Service & Repair',
          'Refrigerator Gas Refilling',
          'Water Purifier Service & Repair',
          'Microwave Service & Repair',
          'Microwave Magnetron Replacement',
          'Microwave Touchpad Repair',
          'Water Cooler Repair Service',
          'Washing Machine Repair & Service'
        ]
      }
    }
  },

  // 3. Electronics (Second Hand)
  'Electronics': {
    icon: FiShoppingBag,
    color: '#ef4444',
    image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03',
    subCategories: {
      'AC': {
        icon: FiWind,
        services: [
          'Buy Second Hand AC',
          'Sell Second Hand AC'
        ]
      },
      'Refrigerator': {
        icon: FiHome,
        services: [
          'Buy Second Hand Refrigerator',
          'Sell Second Hand Refrigerator'
        ]
      },
      'Microwave': {
        icon: FiZap,
        services: [
          'Buy Second Hand Microwave',
          'Sell Second Hand Microwave'
        ]
      },
      'Washing Machine': {
        icon: FiSettings,
        services: [
          'Buy Second Hand Washing Machine',
          'Sell Second Hand Washing Machine'
        ]
      },
      'Water Cooler': {
        icon: FiDroplet,
        services: [
          'Buy Second Hand Water Cooler',
          'Sell Second Hand Water Cooler'
        ]
      },
      'Water Purifier': {
        icon: FiDroplet,
        services: [
          'Buy Second Hand Water Purifier',
          'Sell Second Hand Water Purifier'
        ]
      }
    }
  },

  // 4. Electrical
  'Electrical': {
    icon: FiZap,
    color: '#f97316',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e',
    subCategories: {
      'All Types': {
        icon: FiZap,
        services: [
          'House Wiring Service'
        ]
      }
    }
  },

  // 5. Solar
  'Solar': {
    icon: FiSun,
    color: '#eab308',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276',
    subCategories: {
      'All Types': {
        icon: FiSun,
        services: [
          'Solar Panel Installation',
          'Solar Panel Uninstallation',
          'Solar System Repair & Service'
        ]
      }
    }
  },

  // 6. Plumbing
  'Plumbing': {
    icon: FiDroplet,
    color: '#3b82f6',
    image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7',
    subCategories: {
      'All Types': {
        icon: FiDroplet,
        services: [
          'Plumbing Repair',
          'Pipe Installation',
          'Leak Fixing',
          'Bathroom Fitting',
          'Kitchen Plumbing'
        ]
      }
    }
  },

  // 7. Cleaning
  'Cleaning': {
    icon: FiHome,
    color: '#8b5cf6',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64',
    subCategories: {
      'All Types': {
        icon: FiHome,
        services: [
          'Deep Cleaning',
          'Sofa Cleaning',
          'Carpet Cleaning',
          'Kitchen Cleaning',
          'Bathroom Cleaning'
        ]
      }
    }
  },

  // 8. Packers & Movers
  'Packers & Movers': {
    icon: FiTruck,
    color: '#ec4899',
    image: 'https://images.unsplash.com/photo-1600518464441-9154a4dea21b',
    subCategories: {
      'All Types': {
        icon: FiTruck,
        services: [
          'Home Shifting',
          'Office Shifting',
          'Vehicle Transportation',
          'Packing Services',
          'Loading & Unloading'
        ]
      }
    }
  },

  // 9. Security
  'Security': {
    icon: FiShield,
    color: '#dc2626',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64',
    subCategories: {
      'All Types': {
        icon: FiShield,
        services: [
          'CCTV Installation',
          'Security Guard Services',
          'Alarm System Installation',
          'Access Control Systems'
        ]
      }
    }
  },

  // 10. Maintenance
  'Maintenance': {
    icon: FiTool,
    color: '#059669',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952',
    subCategories: {
      'All Types': {
        icon: FiTool,
        services: [
          'General Maintenance',
          'Preventive Maintenance',
          'Emergency Repairs',
          'Annual Maintenance Contract'
        ]
      }
    }
  },

  // 11. Repair
  'Repair': {
    icon: FiSettings,
    color: '#d97706',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837',
    subCategories: {
      'All Types': {
        icon: FiSettings,
        services: [
          'General Repairs',
          'Furniture Repair',
          'Door & Window Repair',
          'Wall Repair & Painting'
        ]
      }
    }
  },

  // 12. Installation
  'Installation': {
    icon: FiPackage,
    color: '#7c3aed',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837',
    subCategories: {
      'All Types': {
        icon: FiPackage,
        services: [
          'Appliance Installation',
          'Furniture Installation',
          'TV Mounting',
          'Smart Home Setup'
        ]
      }
    }
  }
};