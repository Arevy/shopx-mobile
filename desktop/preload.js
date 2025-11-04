const {contextBridge} = require('electron');

contextBridge.exposeInMainWorld('shopxDesktop', {
  platform: process.platform,
  isDevelopment: process.env.NODE_ENV !== 'production',
});
