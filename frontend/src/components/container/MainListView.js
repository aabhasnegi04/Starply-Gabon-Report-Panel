import React, { useState, useRef } from 'react';
import { 
  Container, Card, CardContent, Typography, TextField, Button, Box, 
  CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import ListIcon from '@mui/icons-material/List';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useReactToPrint } from 'react-to-print';
import * as XLSX from 'xlsx';
import MainListTable from './MainListTable';
import { API_URL } from '../../config';

const MainListView = ({ onBackClick }) => {
  const [container, setContainer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const printRef = useRef();

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: ' ',
    pageStyle: `
      @page { 
        size: A4; 
        margin: 0;
      }
      @media print {
        body { 
          -webkit-print-color-adjust: exact; 
          margin: 0 !important;
          padding: 0 !important;
        }
        .MuiContainer-root { padding: 0 !important; margin: 0 !important; }
        .print-only {
          page-break-after: auto !important;
          break-after: auto !important;
        }
        .print-only > * {
          page-break-after: auto !important;
          break-after: auto !important;
        }
      }
    `
  });

  const handleExcelDownload = () => {
    if (!data || !data.mainRows.length) return;

    // Prepare data for Excel export
    const excelData = data.mainRows.map((row, index) => ({
      'Pallet No.': row.LOTNUMBER || `${index + 1}/${data.mainRows.length}`,
      'Description': `Contre-plaqué ${row.LENGTH} X ${row.WIDTH} X ${row.THICKNESS} MM`,
      'Quantity (PCS)': row.PCS,
      'CBM': parseFloat(row.CBM).toFixed(3),
      'Length (mm)': row.LENGTH,
      'Width (mm)': row.WIDTH,
      'Thickness (mm)': row.THICKNESS,
      'Quality': row.QUALITY,
      'Species': row.SPECIES,
      'Glue': row.GLUE,
      'Type': row.TYPE
    }));

    // Add summary row
    const totalQuantity = data.mainRows.reduce((sum, row) => sum + (parseInt(row.PCS) || 0), 0);
    const totalCBM = data.mainRows.reduce((sum, row) => sum + (parseFloat(row.CBM) || 0), 0);
    
    excelData.push({
      'Pallet No.': '',
      'Description': 'TOTALS',
      'Quantity (PCS)': totalQuantity,
      'CBM': totalCBM.toFixed(3),
      'Length (mm)': '',
      'Width (mm)': '',
      'Thickness (mm)': '',
      'Quality': '',
      'Species': '',
      'Glue': '',
      'Type': ''
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Main List');
    XLSX.writeFile(workbook, `Main_List_${container}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    setData(null);
    try {
      const res = await fetch(`${API_URL}/container/viewpackinglist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ container })
      });
      if (!res.ok) throw new Error('API error: ' + res.statusText);
      const apiData = await res.json();

      // Map recordsets
      const companyInfo = apiData.data?.[0]?.[0] || {};
      const workOrderInfo = apiData.data?.[1]?.[0] || {};
      const mainRows = apiData.data?.[2] || [];
      const containerInfo = apiData.data?.[3]?.[0] || {};
      const certificatesRow = apiData.data?.[4]?.[0] || {};

      if (mainRows.length === 0) {
        setError('No records found for this container.');
        return;
      }

      setData({
        companyInfo,
        workOrderInfo,
        mainRows,
        containerInfo,
        certificates: [
          certificatesRow.CERTIFICATE1,
          certificatesRow.CERTIFICATE2,
          certificatesRow.CERTIFICATE3,
          certificatesRow.CERTIFICATE4,
          certificatesRow.CERTIFICATE5
        ].filter(Boolean)
      });
    } catch (e) {
      setError(e.message || 'Fetch failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 2, pb: 4, px: { xs: 1, md: 2 } }}>
      {/* Search Card */}
      <Card sx={{ 
        mb: 4, 
        borderRadius: 2,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
        background: 'white',
        border: '1px solid #e0e0e0'
      }} className="print-hide">
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
            <SearchIcon sx={{ fontSize: 28, color: '#1b4332', mr: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 600, color: '#1b4332', letterSpacing: '-0.5px' }}>
            Main List Container Search
            </Typography>
          </Box>
          <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} alignItems="stretch">
            <TextField
              label="Enter Container Number"
              variant="outlined"
              value={container}
              onChange={e => setContainer(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !loading && container && handleSearch()}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  backgroundColor: '#fafafa',
                  '&:hover': {
                    backgroundColor: '#fff',
                  },
                  '& fieldset': {
                    borderColor: '#e0e0e0',
                  },
                  '&:hover fieldset': {
                    borderColor: '#1b4332',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1b4332',
                    borderWidth: '1px',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#666',
                },
              }}
              InputProps={{
                style: { fontSize: '1rem', padding: '4px' }
              }}
            />
            <Button
              variant="contained"
              size="large"
              startIcon={<SearchIcon />}
              disabled={loading || !container}
              onClick={handleSearch}
              sx={{
                minWidth: 160,
                borderRadius: 1,
                fontSize: '0.95rem',
                fontWeight: 500,
                background: '#1b4332',
                color: 'white',
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': {
                  background: '#0f2419',
                  boxShadow: 'none',
                }
              }}
            >
              Search
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Results Header with Print Button */}
      {data && (
        <Card sx={{ 
          mb: 3, 
          borderRadius: 2,
          background: 'white',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e0e0e0'
        }} className="print-hide">
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap={2}>
                <ListIcon sx={{ fontSize: 32, color: '#1b4332' }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1b4332' }}>
                    Main List Found
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
                    Container: {container} | {data.mainRows.length} row{data.mainRows.length !== 1 ? 's' : ''}
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<DownloadIcon />}
                  onClick={handleExcelDownload}
                  sx={{
                    minWidth: 160,
                    borderRadius: 1,
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    background: '#2e7d32',
                    color: 'white',
                    textTransform: 'none',
                    boxShadow: 'none',
                    '&:hover': {
                      background: '#1b5e20',
                      boxShadow: 'none',
                    }
                  }}
                >
                  Excel
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PrintIcon />}
                  onClick={handlePrint}
                  sx={{
                    minWidth: 160,
                    borderRadius: 1,
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    background: '#1b4332',
                    color: 'white',
                    textTransform: 'none',
                    boxShadow: 'none',
                    '&:hover': {
                      background: '#0f2419',
                      boxShadow: 'none',
                    }
                  }}
                >
                  Print
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {loading && (
        <Box textAlign="center" py={8} className="print-hide">
          <CircularProgress size={50} sx={{ color: '#1b4332' }} />
          <Typography variant="body1" sx={{ mt: 2, color: '#666', fontWeight: 500 }}>
            Searching container...
          </Typography>
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 1, border: '1px solid #f44336' }} className="print-hide">
          {error}
        </Alert>
      )}

      {/* Preview Table */}
      {data && (
        <Box className="print-hide" sx={{ mb: 4 }}>
          <TableContainer component={Paper} sx={{ 
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)', 
            border: '1px solid #e0e0e0',
            overflowX: 'auto'
          }}>
            <Table sx={{ 
              minWidth: { xs: 1200, md: 650 },
              '& .MuiTableCell-root': {
                fontSize: { xs: '0.7rem', sm: '0.875rem' },
                padding: { xs: '2px 4px', sm: '8px 16px' }
              }
            }} size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#ffb74d' }}>
                  <TableCell sx={{ 
                    fontWeight: 700, 
                    textAlign: 'center', 
                    py: 1,
                    minWidth: { xs: '60px', sm: '80px' }
                  }}>
                    S.No.
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 700, 
                    textAlign: 'center', 
                    py: 1,
                    minWidth: { xs: '80px', sm: '100px' }
                  }}>
                    Length
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 700, 
                    textAlign: 'center', 
                    py: 1,
                    minWidth: { xs: '80px', sm: '100px' }
                  }}>
                    Width
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 700, 
                    textAlign: 'center', 
                    py: 1,
                    minWidth: { xs: '80px', sm: '100px' }
                  }}>
                    Thickness
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 700, 
                    textAlign: 'center', 
                    py: 1,
                    minWidth: { xs: '80px', sm: '100px' }
                  }}>
                    Quality
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 700, 
                    textAlign: 'center', 
                    py: 1,
                    minWidth: { xs: '80px', sm: '100px' }
                  }}>
                    No. of Pcs
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 700, 
                    textAlign: 'center', 
                    py: 1,
                    minWidth: { xs: '80px', sm: '100px' }
                  }}>
                    Species
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 700, 
                    textAlign: 'center', 
                    py: 1,
                    minWidth: { xs: '100px', sm: '120px' }
                  }}>
                    Glue
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 700, 
                    textAlign: 'center', 
                    py: 1,
                    minWidth: { xs: '80px', sm: '100px' }
                  }}>
                    Type
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 700, 
                    textAlign: 'center', 
                    py: 1,
                    minWidth: { xs: '100px', sm: '120px' }
                  }}>
                    Lot Number
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 700, 
                    textAlign: 'center', 
                    py: 1,
                    minWidth: { xs: '100px', sm: '120px' }
                  }}>
                    Total Pallets
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 700, 
                    textAlign: 'center', 
                    py: 1,
                    minWidth: { xs: '80px', sm: '100px' }
                  }}>
                    CBM
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.mainRows.map((row, index) => (
                  <TableRow key={index} hover>
                    <TableCell sx={{ textAlign: 'center' }}>{row.LOTNUMBER || index + 1}</TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>{row.LENGTH || ''}</TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>{row.WIDTH || ''}</TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>{row.THICKNESS || ''}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>{row.QUALITY || ''}</TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>{row.PCS || ''}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>{row.SPECIES || ''}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>{row.GLUE || ''}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>{row.TYPE || ''}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>{row.LOTNUMBER || ''}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>{row.TOTAL_PALLETS || ''}</TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>{row.CBM || ''}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Empty State */}
      {!data && !loading && !error && (
        <Card sx={{ 
          p: 8, 
          textAlign: 'center', 
          borderRadius: 2,
          background: '#fafafa',
          boxShadow: 'none',
          border: '1px dashed #e0e0e0'
        }} className="print-hide">
          <ListIcon sx={{ fontSize: 60, color: '#bdbdbd', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#666', fontWeight: 500 }}>
            No data to display
          </Typography>
          <Typography variant="body2" sx={{ color: '#999', mt: 1 }}>
            Enter a container number above to get started
          </Typography>
        </Card>
      )}

      {/* Hidden Print Area */}
      <div ref={printRef} className="print-only">
        {data && <MainListTable data={data} />}
      </div>
    </Container>
  );
};

export default MainListView;
