import client from './client.js';

const ashaLogService = {
// ashaLogService.js
getLogs: (id) => client.get('/ashalogs', { 
  params: id ? { ashaId: id } : {} 
})
};

export default ashaLogService;
