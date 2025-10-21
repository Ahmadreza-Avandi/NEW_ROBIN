import React from 'react';

/**
 * Demo component to showcase the CRM design system
 * This component demonstrates the new blue color palette and utility classes
 */
export function CRMDesignSystemDemo() {
  return (
    <div className="crm-container crm-section bg-crm-bg min-h-screen">
      <div className="crm-space-lg">
        {/* Typography Demo */}
        <div className="crm-card crm-card-content">
          <h1 className="crm-heading-xl mb-4">CRM Design System Demo</h1>
          <h2 className="crm-heading-lg mb-3">Typography Hierarchy</h2>
          <h3 className="crm-heading-md mb-2">Medium Heading</h3>
          <h4 className="crm-heading-sm mb-2">Small Heading</h4>
          <p className="crm-body mb-2">This is body text using the CRM design system.</p>
          <p className="crm-body-muted mb-2">This is muted body text for secondary information.</p>
          <p className="crm-caption">This is caption text for small details.</p>
        </div>

        {/* Color Palette Demo */}
        <div className="crm-card">
          <div className="crm-card-header">
            <h3 className="crm-heading-md">Color Palette</h3>
          </div>
          <div className="crm-card-content">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-crm-primary rounded-lg mx-auto mb-2"></div>
                <p className="crm-caption">Primary Blue</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-crm-secondary rounded-lg mx-auto mb-2"></div>
                <p className="crm-caption">Secondary Blue</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-crm-light rounded-lg mx-auto mb-2"></div>
                <p className="crm-caption">Light Blue</p>
              </div>
            </div>
          </div>
        </div>

        {/* Button Demo */}
        <div className="crm-card">
          <div className="crm-card-header">
            <h3 className="crm-heading-md">Button Styles</h3>
          </div>
          <div className="crm-card-content">
            <div className="flex flex-wrap gap-4">
              <button className="crm-btn-primary">Primary Button</button>
              <button className="crm-btn-secondary">Secondary Button</button>
              <button className="crm-btn-outline">Outline Button</button>
              <button className="crm-btn-ghost">Ghost Button</button>
            </div>
          </div>
        </div>

        {/* Status Badges Demo */}
        <div className="crm-card">
          <div className="crm-card-header">
            <h3 className="crm-heading-md">Status Badges</h3>
          </div>
          <div className="crm-card-content">
            <div className="flex flex-wrap gap-4">
              <span className="crm-badge-success">Active</span>
              <span className="crm-badge-warning">Suspended</span>
              <span className="crm-badge-error">Expired</span>
              <span className="crm-badge-info">Pending</span>
            </div>
          </div>
        </div>

        {/* Form Elements Demo */}
        <div className="crm-card">
          <div className="crm-card-header">
            <h3 className="crm-heading-md">Form Elements</h3>
          </div>
          <div className="crm-card-content crm-space-md">
            <div>
              <label className="crm-body font-medium mb-1 block">Input Field</label>
              <input 
                type="text" 
                className="crm-input" 
                placeholder="Enter text here..."
              />
            </div>
            <div>
              <label className="crm-body font-medium mb-1 block">Select Dropdown</label>
              <select className="crm-select">
                <option>Choose an option</option>
                <option>Option 1</option>
                <option>Option 2</option>
              </select>
            </div>
            <div>
              <label className="crm-body font-medium mb-1 block">Textarea</label>
              <textarea 
                className="crm-textarea" 
                rows={3}
                placeholder="Enter description..."
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}