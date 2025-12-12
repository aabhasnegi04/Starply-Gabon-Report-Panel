import React, { useState, useRef } from 'react';
import { 
  Container, Card, CardContent, Typography, TextField, Button, Box, 
  CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PrintIcon from '@mui/icons-material/Print';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { useReactToPrint } from 'react-to-print';
import LoadListTable from './LoadListTable';
import { API_URL } from '../../config';

const LoadListView = () => {
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

  // Transform rows for preview
  const getLoadListData = (rows) => {
    return rows.map(row => ({
      length: row.LENGTH,
      width: row.WIDTH,
      thickness: row.THICKNESS,
      pcs: row.PCS,
      palletNumber: row.LOTNUMBER || 0
    })).sort((a, b) => a.palletNumber - b.palletNumber);
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
            <SearchIcon sx={{ fontSize: 28, color: '#1b4332', mr: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 600, color: '#1b4332', letterSpacing: '-0.5px' }}>
              Load List Container Search
            </Typography>
          </Box>
          <Box display="flex" gap={2} alignItems="stretch">
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
                <LocalShippingIcon sx={{ fontSize: 32, color: '#1b4332' }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1b4332' }}>
                    Load List Found
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
                    Container: {container} | {data.mainRows.length} pallet{data.mainRows.length !== 1 ? 's' : ''}
                  </Typography>
                </Box>
              </Box>
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

      {/* Preview with Header Info */}
      {data && (
        <Card className="print-hide" sx={{ mb: 4, borderRadius: 2, background: 'white', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)', border: '1px solid #e0e0e0' }}>
          <CardContent sx={{ p: 4 }}>
            {/* Header Information */}
            <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography sx={{ fontSize: '1.1rem', fontWeight: 600, textAlign: 'center', mb: 2 }}>
                CONTAINER LOADING PLAN
              </Typography>
              <Typography sx={{ fontSize: '0.95rem', fontWeight: 600 }}>
                CONTAINER NUMBER : {data.containerInfo?.ContainerNo || ''} ({data.containerInfo?.Shipping_Line || ''})
              </Typography>
              <Typography sx={{ fontSize: '0.95rem', fontWeight: 600 }}>
                PARTY NAME / PO NO. : {data.containerInfo?.CONSIGNEE || data.workOrderInfo?.Client_Name || ''} / PO {data.containerInfo?.ORDERNO || data.workOrderInfo?.Work_OrderNo || ''}
              </Typography>
              <Typography sx={{ fontSize: '0.95rem', fontWeight: 600 }}>
                TOTAL NUMBER OF PALLETS : {data.mainRows.length} PALLETS
              </Typography>
            </Box>

            {/* Table */}
            <TableContainer component={Paper} sx={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)', border: '1px solid #e0e0e0' }}>
              <Table sx={{ minWidth: 650 }} size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#ffb74d' }}>
                    <TableCell sx={{ fontWeight: 700, textAlign: 'center', py: 1 }}>SIZE AND THICKNESS</TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: 'center', py: 1 }}>NO. OF PALLETS</TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: 'center', py: 1 }}>PCS. PER PALLET</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getLoadListData(data.mainRows).map((row, index) => (
                    <TableRow key={index} hover>
                      <TableCell sx={{ textAlign: 'left' }}>
                        {row.length} X {row.width} X {row.thickness} MM
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        {row.palletNumber}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        {row.pcs}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
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
          <LocalShippingIcon sx={{ fontSize: 60, color: '#bdbdbd', mb: 2 }} />
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
        {data && <LoadListTable data={data} />}
      </div>
    </Container>
  );
};

export default LoadListView;
