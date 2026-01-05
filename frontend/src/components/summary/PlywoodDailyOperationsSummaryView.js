import React, { useState } from 'react';
import { 
  Container, Card, CardContent, Typography, Button, Box, 
  CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, Paper, Tabs, Tab, IconButton
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import DownloadIcon from '@mui/icons-material/Download';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import * as XLSX from 'xlsx';
import { API_URL } from '../../config';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}

const PlywoodDailyOperationsSummaryView = ({ onBackClick }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleExcelDownload = () => {
    if (!data || !data.length) return;

    const wb = XLSX.utils.book_new();

    // Detailed Data Sheet
    if (data[0] && data[0].length > 0) {
      const detailedSheet = XLSX.utils.json_to_sheet(
        data[0].map(item => ({
          'Sr No': item.SRNO || '',
          'Process': item.PROCESS || '',
          'Company': item.COMPANY || '',
          'Shift': item.SHIFT || '',
          'Quality': item.QUALITY || '',
          'Thickness': item.THICKNESS || 0,
          'Size Set': item.SIZESET || '',
          'Length': item.LENGTH || 0,
          'Width': item.WIDTH || 0,
          'Reject PCS': item.REJECTPCS || 0,
          'Reject CBM': item.REJECTCBM || 0,
          'PCS': item.PCS || 0,
          'CBM': item.CBM || 0,
          'Total PCS': item.TOTALPCS || 0,
          'Total CBM': item.TOTALCBM || 0
        }))
      );
      XLSX.utils.book_append_sheet(wb, detailedSheet, 'Detailed Data');
    }

    // Summary by Process Sheet
    if (data[1] && data[1].length > 0) {
      const summarySheet = XLSX.utils.json_to_sheet(
        data[1].map(item => ({
          'Sr No': item.SRNO || '',
          'Process': item.PROCESS || '',
          'Company': item.COMPANY || '',
          'Shift': item.SHIFT || '',
          'Reject PCS': item.REJECTPCS || 0,
          'Reject CBM': item.REJECTCBM || 0,
          'PCS': item.PCS || 0,
          'CBM': item.CBM || 0,
          'Total PCS': item.TOTALPCS || 0,
          'Total CBM': item.TOTALCBM || 0
        }))
      );
      XLSX.utils.book_append_sheet(wb, summarySheet, 'Process Summary');
    }

    // Grand Total Sheet
    if (data[2] && data[2].length > 0) {
      const grandTotalSheet = XLSX.utils.json_to_sheet(
        data[2].map(item => ({
          'Sr No': item.SRNO || '',
          'Process': item.PROCESS || '',
          'Reject PCS': item.REJECTPCS || 0,
          'Reject CBM': item.REJECTCBM || 0,
          'PCS': item.PCS || 0,
          'CBM': item.CBM || 0,
          'Total PCS': item.TOTALPCS || 0,
          'Total CBM': item.TOTALCBM || 0
        }))
      );
      XLSX.utils.book_append_sheet(wb, grandTotalSheet, 'Grand Total');
    }

    const dateRange = `${fromDate.format('YYYY-MM-DD')}_to_${toDate.format('YYYY-MM-DD')}`;
    XLSX.writeFile(wb, `Plywood_Daily_Operations_Summary_${dateRange}.xlsx`);
  };

  const fetchData = async () => {
    if (!fromDate || !toDate) {
      setError('Please select both From Date and To Date');
      return;
    }

    setLoading(true);
    setError('');
    setData(null);
    try {
      const res = await fetch(`${API_URL}/order/plywooddailyoperationssummary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from_date: fromDate.format('YYYY-MM-DD'),
          to_date: toDate.format('YYYY-MM-DD')
        })
      });
      
      if (!res.ok) throw new Error('API error: ' + res.statusText);
      const apiData = await res.json();

      if (!apiData.data || apiData.data.length === 0) {
        setError('No data found for the selected date range.');
        return;
      }

      setData(apiData.data);
    } catch (e) {
      setError(e.message || 'Fetch failed');
    } finally {
      setLoading(false);
    }
  };

  const renderDetailedTable = () => {
    if (!data || !data[0] || data[0].length === 0) return null;

    return (
      <TableContainer sx={{ maxHeight: 600, overflowX: 'auto' }}>
        <Table stickyHeader size="small" sx={{ minWidth: { xs: 1800, md: 1200 } }}>
          <TableHead>
            <TableRow sx={{ background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)' }}>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center', py: 2, color: '#ffffff', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.2)', background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)' }}>Sr No</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center', py: 2, color: '#ffffff', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.2)', background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)' }}>Process</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center', py: 2, color: '#ffffff', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.2)', background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)' }}>Company</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center', py: 2, color: '#ffffff', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.2)', background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)' }}>Shift</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center', py: 2, color: '#ffffff', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.2)', background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)' }}>Quality</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center', py: 2, color: '#ffffff', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.2)', background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)' }}>Thickness</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center', py: 2, color: '#ffffff', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.2)', background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)' }}>Size Set</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center', py: 2, color: '#ffffff', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.2)', background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)' }}>Length</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center', py: 2, color: '#ffffff', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.2)', background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)' }}>Width</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center', py: 2, color: '#ffffff', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.2)', background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)' }}>Reject PCS</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center', py: 2, color: '#ffffff', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.2)', background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)' }}>Reject CBM</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center', py: 2, color: '#ffffff', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.2)', background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)' }}>PCS</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center', py: 2, color: '#ffffff', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.2)', background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)' }}>CBM</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center', py: 2, color: '#ffffff', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.2)', background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)' }}>Total PCS</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center', py: 2, color: '#ffffff', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase', background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)' }}>Total CBM</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data[0].map((row, index) => (
              <TableRow 
                key={index}
                sx={{
                  backgroundColor: row.PROCESS === 'GRAND TOTAL : ' ? '#e3f2fd' : (index % 2 === 0 ? '#ffffff' : '#f8faf9'),
                  fontWeight: row.PROCESS === 'GRAND TOTAL : ' ? 'bold' : 'normal',
                  '&:hover': {
                    backgroundColor: row.PROCESS === 'GRAND TOTAL : ' ? '#e3f2fd' : '#e8f5e9',
                    transform: 'scale(1.001)',
                    boxShadow: '0 2px 8px rgba(27, 67, 50, 0.1)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <TableCell sx={{ textAlign: 'center', py: 1.5, fontWeight: 600, color: '#1b4332', fontSize: '0.85rem' }}>{row.SRNO || ''}</TableCell>
                <TableCell sx={{ textAlign: 'left', py: 1.5, color: '#333', fontSize: '0.85rem', fontWeight: 600 }}>
                  {row.PROCESS === 'GRAND TOTAL : ' ? (
                    <Chip label={row.PROCESS} color="primary" size="small" />
                  ) : (
                    row.PROCESS
                  )}
                </TableCell>
                <TableCell sx={{ textAlign: 'center', py: 1.5, color: '#555', fontSize: '0.85rem' }}>{row.COMPANY || ''}</TableCell>
                <TableCell sx={{ textAlign: 'center', py: 1.5, color: '#555', fontSize: '0.85rem' }}>{row.SHIFT || ''}</TableCell>
                <TableCell sx={{ textAlign: 'center', py: 1.5, color: '#555', fontSize: '0.85rem' }}>{row.QUALITY || ''}</TableCell>
                <TableCell sx={{ textAlign: 'right', py: 1.5, color: '#555', fontSize: '0.85rem' }}>{row.THICKNESS || 0}</TableCell>
                <TableCell sx={{ textAlign: 'center', py: 1.5, color: '#555', fontSize: '0.85rem' }}>{row.SIZESET || ''}</TableCell>
                <TableCell sx={{ textAlign: 'right', py: 1.5, color: '#555', fontSize: '0.85rem' }}>{row.LENGTH || 0}</TableCell>
                <TableCell sx={{ textAlign: 'right', py: 1.5, color: '#555', fontSize: '0.85rem' }}>{row.WIDTH || 0}</TableCell>
                <TableCell sx={{ textAlign: 'right', py: 1.5, color: '#d32f2f', fontSize: '0.85rem', fontWeight: 600 }}>{row.REJECTPCS?.toLocaleString() || 0}</TableCell>
                <TableCell sx={{ textAlign: 'right', py: 1.5, color: '#d32f2f', fontSize: '0.85rem', fontWeight: 600 }}>{row.REJECTCBM ? parseFloat(row.REJECTCBM).toFixed(3) : '0.000'}</TableCell>
                <TableCell sx={{ textAlign: 'right', py: 1.5, color: '#2e7d32', fontSize: '0.85rem', fontWeight: 600 }}>{row.PCS?.toLocaleString() || 0}</TableCell>
                <TableCell sx={{ textAlign: 'right', py: 1.5, color: '#2e7d32', fontSize: '0.85rem', fontWeight: 600 }}>{row.CBM ? parseFloat(row.CBM).toFixed(3) : '0.000'}</TableCell>
                <TableCell sx={{ textAlign: 'right', py: 1.5, color: '#1b4332', fontSize: '0.85rem', fontWeight: 700 }}>{row.TOTALPCS?.toLocaleString() || 0}</TableCell>
                <TableCell sx={{ textAlign: 'right', py: 1.5, color: '#1b4332', fontSize: '0.85rem', fontWeight: 700 }}>{row.TOTALCBM ? parseFloat(row.TOTALCBM).toFixed(3) : '0.000'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderSummaryTable = () => {
    if (!data || !data[1] || data[1].length === 0) return null;

    return (
      <TableContainer sx={{ maxHeight: 600, overflowX: 'auto' }}>
        <Table stickyHeader size="small" sx={{ minWidth: { xs: 1200, md: 800 } }}>
          <TableHead>
            <TableRow sx={{ background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)' }}>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center', py: 2, color: '#ffffff', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.2)', background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)' }}>Sr No</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center', py: 2, color: '#ffffff', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.2)', background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)' }}>Process</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center', py: 2, color: '#ffffff', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.2)', background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)' }}>Company</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center', py: 2, color: '#ffffff', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.2)', background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)' }}>Shift</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center', py: 2, color: '#ffffff', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.2)', background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)' }}>Reject PCS</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center', py: 2, color: '#ffffff', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.2)', background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)' }}>Reject CBM</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center', py: 2, color: '#ffffff', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.2)', background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)' }}>PCS</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center', py: 2, color: '#ffffff', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.2)', background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)' }}>CBM</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center', py: 2, color: '#ffffff', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.2)', background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)' }}>Total PCS</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center', py: 2, color: '#ffffff', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase', background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)' }}>Total CBM</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data[1].map((row, index) => (
              <TableRow 
                key={index}
                sx={{
                  backgroundColor: row.PROCESS === 'GRAND TOTAL : ' ? '#e3f2fd' : (index % 2 === 0 ? '#ffffff' : '#f8faf9'),
                  fontWeight: row.PROCESS === 'GRAND TOTAL : ' ? 'bold' : 'normal',
                  '&:hover': {
                    backgroundColor: row.PROCESS === 'GRAND TOTAL : ' ? '#e3f2fd' : '#e8f5e9',
                    transform: 'scale(1.001)',
                    boxShadow: '0 2px 8px rgba(27, 67, 50, 0.1)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <TableCell sx={{ textAlign: 'center', py: 1.5, fontWeight: 600, color: '#1b4332', fontSize: '0.85rem' }}>{row.SRNO || ''}</TableCell>
                <TableCell sx={{ textAlign: 'left', py: 1.5, color: '#333', fontSize: '0.85rem', fontWeight: 600 }}>
                  {row.PROCESS === 'GRAND TOTAL : ' ? (
                    <Chip label={row.PROCESS} color="primary" size="small" />
                  ) : (
                    row.PROCESS
                  )}
                </TableCell>
                <TableCell sx={{ textAlign: 'center', py: 1.5, color: '#555', fontSize: '0.85rem' }}>{row.COMPANY || ''}</TableCell>
                <TableCell sx={{ textAlign: 'center', py: 1.5, color: '#555', fontSize: '0.85rem' }}>{row.SHIFT || ''}</TableCell>
                <TableCell sx={{ textAlign: 'right', py: 1.5, color: '#d32f2f', fontSize: '0.85rem', fontWeight: 600 }}>{row.REJECTPCS?.toLocaleString() || 0}</TableCell>
                <TableCell sx={{ textAlign: 'right', py: 1.5, color: '#d32f2f', fontSize: '0.85rem', fontWeight: 600 }}>{row.REJECTCBM ? parseFloat(row.REJECTCBM).toFixed(3) : '0.000'}</TableCell>
                <TableCell sx={{ textAlign: 'right', py: 1.5, color: '#2e7d32', fontSize: '0.85rem', fontWeight: 600 }}>{row.PCS?.toLocaleString() || 0}</TableCell>
                <TableCell sx={{ textAlign: 'right', py: 1.5, color: '#2e7d32', fontSize: '0.85rem', fontWeight: 600 }}>{row.CBM ? parseFloat(row.CBM).toFixed(3) : '0.000'}</TableCell>
                <TableCell sx={{ textAlign: 'right', py: 1.5, color: '#1b4332', fontSize: '0.85rem', fontWeight: 700 }}>{row.TOTALPCS?.toLocaleString() || 0}</TableCell>
                <TableCell sx={{ textAlign: 'right', py: 1.5, color: '#1b4332', fontSize: '0.85rem', fontWeight: 700 }}>{row.TOTALCBM ? parseFloat(row.TOTALCBM).toFixed(3) : '0.000'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderGrandTotalTable = () => {
    if (!data || !data[2] || data[2].length === 0) return null;

    return (
      <TableContainer sx={{ maxHeight: 400, overflowX: 'auto' }}>
        <Table stickyHeader size="small" sx={{ minWidth: { xs: 800, md: 600 } }}>
          <TableHead>
            <TableRow sx={{ background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)' }}>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center', py: 2, color: '#ffffff', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.2)', background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)' }}>Sr No</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center', py: 2, color: '#ffffff', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.2)', background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)' }}>Process</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center', py: 2, color: '#ffffff', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.2)', background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)' }}>Reject PCS</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center', py: 2, color: '#ffffff', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.2)', background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)' }}>Reject CBM</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center', py: 2, color: '#ffffff', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.2)', background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)' }}>PCS</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center', py: 2, color: '#ffffff', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.2)', background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)' }}>CBM</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center', py: 2, color: '#ffffff', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase', borderRight: '1px solid rgba(255, 255, 255, 0.2)', background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)' }}>Total PCS</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center', py: 2, color: '#ffffff', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase', background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)' }}>Total CBM</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data[2].map((row, index) => (
              <TableRow 
                key={index}
                sx={{
                  backgroundColor: row.PROCESS === 'GRAND TOTAL : ' ? '#e3f2fd' : (index % 2 === 0 ? '#ffffff' : '#f8faf9'),
                  fontWeight: row.PROCESS === 'GRAND TOTAL : ' ? 'bold' : 'normal',
                  '&:hover': {
                    backgroundColor: row.PROCESS === 'GRAND TOTAL : ' ? '#e3f2fd' : '#e8f5e9',
                    transform: 'scale(1.001)',
                    boxShadow: '0 2px 8px rgba(27, 67, 50, 0.1)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <TableCell sx={{ textAlign: 'center', py: 1.5, fontWeight: 600, color: '#1b4332', fontSize: '0.85rem' }}>{row.SRNO || ''}</TableCell>
                <TableCell sx={{ textAlign: 'left', py: 1.5, color: '#333', fontSize: '0.85rem', fontWeight: 600 }}>
                  {row.PROCESS === 'GRAND TOTAL : ' ? (
                    <Chip label={row.PROCESS} color="primary" size="small" />
                  ) : (
                    row.PROCESS
                  )}
                </TableCell>
                <TableCell sx={{ textAlign: 'right', py: 1.5, color: '#d32f2f', fontSize: '0.85rem', fontWeight: 600 }}>{row.REJECTPCS?.toLocaleString() || 0}</TableCell>
                <TableCell sx={{ textAlign: 'right', py: 1.5, color: '#d32f2f', fontSize: '0.85rem', fontWeight: 600 }}>{row.REJECTCBM ? parseFloat(row.REJECTCBM).toFixed(3) : '0.000'}</TableCell>
                <TableCell sx={{ textAlign: 'right', py: 1.5, color: '#2e7d32', fontSize: '0.85rem', fontWeight: 700 }}>{row.PCS?.toLocaleString() || 0}</TableCell>
                <TableCell sx={{ textAlign: 'right', py: 1.5, color: '#2e7d32', fontSize: '0.85rem', fontWeight: 700 }}>{row.CBM ? parseFloat(row.CBM).toFixed(3) : '0.000'}</TableCell>
                <TableCell sx={{ textAlign: 'right', py: 1.5, color: '#1b4332', fontSize: '0.85rem', fontWeight: 700 }}>{row.TOTALPCS?.toLocaleString() || 0}</TableCell>
                <TableCell sx={{ textAlign: 'right', py: 1.5, color: '#1b4332', fontSize: '0.85rem', fontWeight: 700 }}>{row.TOTALCBM ? parseFloat(row.TOTALCBM).toFixed(3) : '0.000'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 2, pb: 4, px: { xs: 1, md: 2 } }}>
      {/* Header Card */}
      <Card sx={{ 
        mb: 4, 
        borderRadius: 3,
        boxShadow: '0 4px 12px rgba(27, 67, 50, 0.1)',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8faf9 100%)',
        border: '1px solid #e8f5e9'
      }}>
        <CardContent sx={{ p: 4 }}>
          <Box display="flex" alignItems="center" mb={3}>
            {onBackClick && (
              <IconButton 
                onClick={onBackClick}
                sx={{ 
                  mr: 2, 
                  color: '#1b4332',
                  '&:hover': { backgroundColor: '#f5f5f5' }
                }}
              >
                <ArrowBackIcon />
              </IconButton>
            )}
            <Box sx={{ 
              background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
              borderRadius: 2,
              p: 1.5,
              mr: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <PrecisionManufacturingIcon sx={{ fontSize: 28, color: '#ffffff' }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1b4332', letterSpacing: '-0.5px' }}>
                Plywood Daily Operations Summary
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
                Comprehensive production operations summary for custom date range
              </Typography>
            </Box>
          </Box>

          {/* Date Filters */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2} alignItems="stretch">
              <DatePicker
                label="From Date"
                value={fromDate}
                onChange={(newValue) => setFromDate(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    sx: {
                      flex: 1,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: '#fff',
                        '&:hover fieldset': {
                          borderColor: '#1b4332',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#1b4332',
                          borderWidth: '2px',
                        },
                      },
                    }
                  },
                  popper: {
                    sx: {
                      '& .MuiPaper-root': {
                        borderRadius: 2,
                        boxShadow: '0 8px 24px rgba(27, 67, 50, 0.15)',
                      },
                      '& .MuiPickersDay-root': {
                        borderRadius: 1.5,
                        '&.Mui-selected': {
                          backgroundColor: '#1b4332',
                          '&:hover': {
                            backgroundColor: '#0f2419',
                          },
                        },
                      },
                      '& .MuiPickersCalendarHeader-root': {
                        color: '#1b4332',
                      },
                    }
                  }
                }}
              />
              <DatePicker
                label="To Date"
                value={toDate}
                onChange={(newValue) => setToDate(newValue)}
                minDate={fromDate}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    sx: {
                      flex: 1,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: '#fff',
                        '&:hover fieldset': {
                          borderColor: '#1b4332',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#1b4332',
                          borderWidth: '2px',
                        },
                      },
                    }
                  },
                  popper: {
                    sx: {
                      '& .MuiPaper-root': {
                        borderRadius: 2,
                        boxShadow: '0 8px 24px rgba(27, 67, 50, 0.15)',
                      },
                      '& .MuiPickersDay-root': {
                        borderRadius: 1.5,
                        '&.Mui-selected': {
                          backgroundColor: '#1b4332',
                          '&:hover': {
                            backgroundColor: '#0f2419',
                          },
                        },
                      },
                      '& .MuiPickersCalendarHeader-root': {
                        color: '#1b4332',
                      },
                    }
                  }
                }}
              />
              <Button
                variant="contained"
                size="large"
                startIcon={<SearchIcon />}
                onClick={fetchData}
                disabled={loading || !fromDate || !toDate}
                sx={{
                  minWidth: { xs: '100%', md: 160 },
                  width: { xs: '100%', md: 'auto' },
                  borderRadius: 2,
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
                  color: '#ffffff',
                  textTransform: 'none',
                  boxShadow: '0 4px 12px rgba(27, 67, 50, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0f2419 0%, #1b4332 100%)',
                    boxShadow: '0 6px 16px rgba(27, 67, 50, 0.4)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Generate Report
              </Button>
            </Box>
          </LocalizationProvider>
        </CardContent>
      </Card>

      {/* Results Header with Download Button */}
      {data && (
        <Card sx={{ 
          mb: 3, 
          borderRadius: 3,
          background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
          boxShadow: '0 4px 12px rgba(27, 67, 50, 0.2)',
        }}>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }} gap={2}>
              <Box display="flex" alignItems="center" gap={2}>
                <Box sx={{ 
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: 2,
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <PrecisionManufacturingIcon sx={{ fontSize: 32, color: '#ffffff' }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#ffffff' }}>
                    Plywood Operations Summary
                  </Typography>
                  <Box display="flex" gap={1} alignItems="center" mt={0.5} flexWrap="wrap">
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                      {fromDate?.format('MMM DD, YYYY')} to {toDate?.format('MMM DD, YYYY')}
                    </Typography>
                    <Chip 
                      label={`${data[2]?.length || 0} process${(data[2]?.length || 0) !== 1 ? 'es' : ''}`}
                      size="small"
                      sx={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                        color: '#1b4332',
                        fontWeight: 600,
                        fontSize: '0.85rem'
                      }}
                    />
                  </Box>
                </Box>
              </Box>
              <Button
                variant="contained"
                size="large"
                startIcon={<DownloadIcon />}
                onClick={handleExcelDownload}
                sx={{
                  minWidth: { xs: '100%', md: 180 },
                  width: { xs: '100%', md: 'auto' },
                  borderRadius: 2,
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  background: '#ffffff',
                  color: '#1b4332',
                  textTransform: 'none',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  '&:hover': {
                    background: '#f1f8f4',
                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Download Excel
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {loading && (
        <Box textAlign="center" py={8}>
          <CircularProgress size={50} sx={{ color: '#1b4332' }} />
          <Typography variant="body1" sx={{ mt: 2, color: '#666', fontWeight: 500 }}>
            Loading plywood operations summary...
          </Typography>
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 1, border: '1px solid #f44336' }}>
          {error}
        </Alert>
      )}

      {/* Data Display with Tabs */}
      {data && !loading && (
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', border: '1px solid #e8f5e9' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="report tabs"
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  color: '#666',
                  '&.Mui-selected': {
                    color: '#1b4332',
                  },
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#1b4332',
                  height: 3,
                },
              }}
            >
              <Tab label="Detailed Data" />
              <Tab label="Process Summary" />
              <Tab label="Grand Total" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            {renderDetailedTable()}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {renderSummaryTable()}
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {renderGrandTotalTable()}
          </TabPanel>
        </Card>
      )}

      {/* Empty State */}
      {!data && !loading && !error && (
        <Card sx={{ 
          p: 8, 
          textAlign: 'center', 
          borderRadius: 3,
          background: 'linear-gradient(135deg, #f8faf9 0%, #ffffff 100%)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          border: '2px dashed #d0e8d5'
        }}>
          <Box sx={{
            background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
            borderRadius: '50%',
            width: 100,
            height: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            mb: 3
          }}>
            <PrecisionManufacturingIcon sx={{ fontSize: 50, color: '#1b4332' }} />
          </Box>
          <Typography variant="h5" sx={{ color: '#1b4332', fontWeight: 700, mb: 1 }}>
            Select Date Range
          </Typography>
          <Typography variant="body1" sx={{ color: '#666', mt: 1 }}>
            Choose from and to dates to view plywood operations summary
          </Typography>
        </Card>
      )}
    </Container>
  );
};

export default PlywoodDailyOperationsSummaryView;