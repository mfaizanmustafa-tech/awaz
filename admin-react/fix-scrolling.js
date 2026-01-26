const fs = require('fs');
const path = require('path');

const files = [
  'overview/OverviewPage.js',
  'shows/ShowsPage.js',
  'my-channel/MyChannelPage.js',
  'performers/PerformersPage.js',
  'guests/GuestsPage.js',
  'analytics/AnalyticsPage.js'
];

const basePath = 'src/app/main/station-owner';

files.forEach(file => {
  const filePath = path.join(basePath, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove FusePageSimple import
  content = content.replace(/import FusePageSimple from '@fuse\/core\/FusePageSimple';\n/g, '');
  
  // Remove Root styled component
  content = content.replace(/const Root = styled\(FusePageSimple\)\([^)]+\)\);\n\n/gs, '');
  
  // Replace <Root with <div
  content = content.replace(/<Root\s+/g, '<div className="w-full" ');
  
  // Replace header={ with a comment
  content = content.replace(/header=\{[^}]+\}/gs, (match) => {
    const headerContent = match.match(/header=\{([^}]+)\}/s);
    if (headerContent) {
      return `>{/* Header: ${headerContent[1].substring(0, 50)}... */}`;
    }
    return '>';
  });
  
  // Replace content={ with children
  content = content.replace(/content=\{/g, '>{');
  
  // Replace closing </Root> with </div>
  content = content.replace(/<\/Root>/g, '</div>');
  
  // Fix any remaining /> that should be >
  content = content.replace(/className="w-full"\s+\/>/g, 'className="w-full">');
  
  fs.writeFileSync(filePath, content);
  console.log(`Fixed: ${file}`);
});

console.log('All files fixed!');
