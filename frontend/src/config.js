// API Configuration
const config = {
  development: {
    API_URL: 'http://localhost:3001'
  },
  production: {
    API_URL: 'https://rpadmin.stpudhim.in'
  }
};

const environment = process.env.NODE_ENV || 'development';

export const API_URL = config[environment].API_URL;

