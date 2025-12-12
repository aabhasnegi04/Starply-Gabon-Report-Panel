import React, { useState, useRef } from 'react';
import { 
  Container, Card, CardContent, Typography, TextField, Button, Box, 
  CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PrintIcon from '@mui/icons-material/Print';
import InventoryIcon from '@mui/icons-material/Inventory';
import { useReactToPrint } from 'react-to-print';
import PackingListTable from './PackingListTable';
import { API_URL } from '../../config';

const PackingListView = () => {
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
  const getPackingListData = (rows) => {
    let cumulativeCBM = 0;
    return rows.map(row => {
      const cbm = parseFloat(row.CBM) || 0;
      cumulativeCBM += cbm;
      return {
        ...row,
        individualCBM: cbm,
        cumulativeCBM: cumulativeCBM
      };
    });
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
              Packing List Container Search
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
                <InventoryIcon sx={{ fontSize: 32, color: '#1b4332' }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1b4332' }}>
                    Packing List Found
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
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, textAlign: 'center', mb: 2 }}>
                SPECIFICATION
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, mb: 0.5 }}>
                  Exporter:
                </Typography>
                <Typography sx={{ fontSize: '0.85rem', mb: 0.3 }}>
                  {data.companyInfo?.Company_Name || 'STAR PLY GABON'}
                </Typography>
                <Typography sx={{ fontSize: '0.85rem', mb: 0.3 }}>
                  {data.companyInfo?.ADDRESS || 'BP 1024, PLOT NO B2/B1, GSEZ, NKOK, LIBREVILLE, GABON'}
                </Typography>
                <Typography sx={{ fontSize: '0.85rem' }}>
                  Email: {data.companyInfo?.WEBSITE || 'starplygabon@gmail.com'}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, mb: 0.5 }}>
                  Consignee (Destinataire):
                </Typography>
                <Typography sx={{ fontSize: '0.85rem', mb: 0.3 }}>
                  {data.containerInfo?.CONSIGNEE || data.workOrderInfo?.Client_Name || ''}
                </Typography>
                {data.workOrderInfo?.CONSIGNEE_NAME && (
                  <Typography sx={{ fontSize: '0.85rem', mb: 0.3 }}>
                    P/C: {data.workOrderInfo.CONSIGNEE_NAME}
                  </Typography>
                )}
                {data.workOrderInfo?.SHIPTO_PARTYNAME && (
                  <Typography sx={{ fontSize: '0.85rem', mb: 0.3 }}>
                    {data.workOrderInfo.SHIPTO_PARTYNAME}
                  </Typography>
                )}
                {data.workOrderInfo?.DESTINATION_COUNTRY && (
                  <Typography sx={{ fontSize: '0.85rem' }}>
                    {data.workOrderInfo.DESTINATION_COUNTRY}
                  </Typography>
                )}
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
                <Typography sx={{ fontSize: '0.85rem' }}>
                  <strong>Date:</strong> {data.containerInfo?.LOADINGDATE ? new Date(data.containerInfo.LOADINGDATE).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </Typography>
                <Typography sx={{ fontSize: '0.85rem' }}>
                  <strong>Port of Loading:</strong> {data.containerInfo?.PortofLoading || 'LIBREVILLE, GABON'}
                </Typography>
                <Typography sx={{ fontSize: '0.85rem' }}>
                  <strong>Species:</strong> {data.containerInfo?.SPICES || ''}
                </Typography>
                <Typography sx={{ fontSize: '0.85rem' }}>
                  <strong>Purchase Order No.:</strong> PO {data.containerInfo?.ORDERNO || data.workOrderInfo?.Work_OrderNo || ''}
                </Typography>
                <Typography sx={{ fontSize: '0.85rem' }}>
                  <strong>Incoterm:</strong> {data.workOrderInfo?.SHIPPING_TERM || 'FOB'}
                </Typography>
                <Typography sx={{ fontSize: '0.85rem' }}>
                  <strong>Shipped Through:</strong> {data.containerInfo?.Shipping_Line || data.workOrderInfo?.SHIPPING_LINE || ''}
                </Typography>
                <Typography sx={{ fontSize: '0.85rem' }}>
                  <strong>Port of Discharge:</strong> {data.containerInfo?.DESTINATION || data.workOrderInfo?.DESTINATION_PORTNAME || ''}
                </Typography>
              </Box>
            </Box>

            {/* Container and Seal Info - Displayed above table */}
            <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
              {data.containerInfo?.ContainerNo && (
                <Typography sx={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  <strong>Conteneur:</strong> {data.containerInfo.ContainerNo}
                </Typography>
              )}
              {data.containerInfo?.SEAL_NO && (
                <Typography sx={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  <strong>Plomb:</strong> {data.containerInfo.SEAL_NO}
                </Typography>
              )}
            </Box>

            {/* Table - PALLET NO. first, then Description, Quantité, Metre Cube */}
            <TableContainer component={Paper} sx={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)', border: '1px solid #e0e0e0', mb: 2 }}>
              <Table sx={{ minWidth: 650 }} size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#ffb74d' }}>
                    <TableCell sx={{ fontWeight: 700, textAlign: 'left', py: 1 }}>PALLET NO.</TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: 'left', py: 1 }}>Description des biens</TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: 'left', py: 1 }}>Quantité</TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: 'left', py: 1 }}>Metre Cube</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getPackingListData(data.mainRows).map((row, index) => (
                    <TableRow key={index} hover>
                      <TableCell sx={{ textAlign: 'center' }}>
                        {row.LOTNUMBER || index + 1}/{row.TOTAL_PALLETS || data.mainRows.length}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'left' }}>
                        Contre-plaqué {row.LENGTH} X {row.WIDTH} X {row.THICKNESS} MM
                      </TableCell>
                      <TableCell sx={{ textAlign: 'left' }}>
                        {row.PCS} PCS. (1 PACKAGE OF {row.PCS} PCS.)
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>
                        {row.individualCBM.toFixed(3)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Summary */}
            <Box sx={{ mt: 2 }}>
              <Typography sx={{ fontSize: '0.85rem', mb: 1 }}>
                <strong>Note:</strong> Pour Industrie DuBois
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', mb: 0.5 }}>
                <strong>TOTAL {data.mainRows.length} PACKAGE</strong>
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', mb: 0.5 }}>
                <strong>Total Metre Cube:</strong> {getPackingListData(data.mainRows).reduce((sum, row) => sum + row.individualCBM, 0).toFixed(3)}
              </Typography>
              <Typography sx={{ fontSize: '0.85rem' }}>
                <strong>Poids Net (Net Weight):</strong> {data.workOrderInfo?.Poids_Net || '22500'} KGS
              </Typography>
            </Box>
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
          <InventoryIcon sx={{ fontSize: 60, color: '#bdbdbd', mb: 2 }} />
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
        {data && <PackingListTable data={data} />}
      </div>
    </Container>
  );
};

export default PackingListView;
