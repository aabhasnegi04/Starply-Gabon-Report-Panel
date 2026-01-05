import React, { useState, useRef } from 'react';
import { 
  Container, Card, CardContent, Typography, TextField, Button, Box, 
  CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import InventoryIcon from '@mui/icons-material/Inventory';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useReactToPrint } from 'react-to-print';
import * as XLSX from 'xlsx';
import PackingListTable from './PackingListTable';
import { API_URL } from '../../config';

const PackingListView = ({ onBackClick }) => {
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
      'Glue': row.GLUE,
      'Type': row.TYPE,
      'CBM': parseFloat(row.CBM).toFixed(3),
      'Length (mm)': row.LENGTH,
      'Width (mm)': row.WIDTH,
      'Thickness (mm)': row.THICKNESS,
      'Quality': row.QUALITY,
      'Species': row.SPECIES
    }));

    // Add summary row
    const totalQuantity = data.mainRows.reduce((sum, row) => sum + (parseInt(row.PCS) || 0), 0);
    const totalCBM = data.mainRows.reduce((sum, row) => sum + (parseFloat(row.CBM) || 0), 0);
    
    excelData.push({
      'Pallet No.': '',
      'Description': 'TOTALS',
      'Quantity (PCS)': totalQuantity,
      'Glue': '',
      'Type': '',
      'CBM': totalCBM.toFixed(3),
      'Length (mm)': '',
      'Width (mm)': '',
      'Thickness (mm)': '',
      'Quality': '',
      'Species': ''
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Packing List');
    XLSX.writeFile(workbook, `Packing_List_${container}_${new Date().toISOString().split('T')[0]}.xlsx`);
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
      const summaryRows = apiData.data?.[5] || []; // Recordset 6 (index 5)
      const originData = apiData.data?.[6]?.[0] || {}; // Recordset 7 (index 6)

      if (mainRows.length === 0) {
        setError('No records found for this container.');
        return;
      }

      setData({
        companyInfo,
        workOrderInfo,
        mainRows,
        containerInfo,
        summaryRows,
        originData,
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
        <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
          <Box display="flex" alignItems="center" mb={{ xs: 2, sm: 3 }}>
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
            <SearchIcon sx={{ fontSize: { xs: 24, sm: 28 }, color: '#1b4332', mr: 2 }} />
            <Typography variant="h4" sx={{ 
              fontWeight: 600, 
              color: '#1b4332', 
              letterSpacing: '-0.5px',
              fontSize: { xs: '1.5rem', sm: '2.125rem' }
            }}>
              Packing List Container Search
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
                minWidth: { xs: '100%', sm: 160 },
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
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} gap={2}>
              <Box display="flex" alignItems="center" gap={2}>
                <InventoryIcon sx={{ fontSize: { xs: 28, sm: 32 }, color: '#1b4332' }} />
                <Box>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600, 
                    color: '#1b4332',
                    fontSize: { xs: '1.1rem', sm: '1.25rem' }
                  }}>
                    Packing List Found
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', mt: 0.5, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                    Container: {container} | {data.mainRows.length} pallet{data.mainRows.length !== 1 ? 's' : ''}
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<DownloadIcon />}
                  onClick={handleExcelDownload}
                  sx={{
                    minWidth: { xs: '100%', sm: 160 },
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
                    minWidth: { xs: '100%', sm: 160 },
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

      {/* Preview with Header Info */}
      {data && (
        <Card className="print-hide" sx={{ mb: 4, borderRadius: 2, background: 'white', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)', border: '1px solid #e0e0e0' }}>
          <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
            {/* Header Information */}
            <Box sx={{ mb: { xs: 2, sm: 3 } }}>
              <Typography sx={{ 
                fontSize: { xs: '1rem', sm: '1.2rem' }, 
                fontWeight: 700, 
                textAlign: 'center', 
                mb: { xs: 1.5, sm: 2 } 
              }}>
                SPECIFICATION
              </Typography>
              
              <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
                <Typography sx={{ 
                  fontSize: { xs: '0.8rem', sm: '0.9rem' }, 
                  fontWeight: 700, 
                  mb: 0.5 
                }}>
                  Consignee (Destinataire):
                </Typography>
                <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.85rem' }, mb: 0.3 }}>
                  {data.workOrderInfo?.SHIPTO_PARTYNAME || data.containerInfo?.CONSIGNEE || ''}
                </Typography>
                {data.workOrderInfo?.Client_Name && (
                  <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.85rem' }, mb: 0.3 }}>
                    P/C : {data.workOrderInfo.Client_Name}
                  </Typography>
                )}
                {(data.workOrderInfo?.SHIPTOADDRESS || data.workOrderInfo?.shiptoaddress || data.workOrderInfo?.ShipToAddress) && (
                  <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.85rem' }, mb: 0.3 }}>
                    {data.workOrderInfo?.SHIPTOADDRESS || data.workOrderInfo?.shiptoaddress || data.workOrderInfo?.ShipToAddress || ''}
                  </Typography>
                )}
                {data.workOrderInfo?.CONSIGNEE_NAME && (
                  <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.85rem' }, mb: 0.3 }}>
                    P/C: {data.workOrderInfo.CONSIGNEE_NAME}
                  </Typography>
                )}
                {data.workOrderInfo?.DESTINATION_COUNTRY && (
                  <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.85rem' }, mb: 0.3 }}>
                    {data.workOrderInfo.DESTINATION_COUNTRY}
                  </Typography>
                )}
                <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.85rem' } }}>
                  Source d'approvisionnement: CFAD {data.originData?.ORIGIN || 'HAUT-ABANGA'} - UFA-UFG1 {data.originData?.AAC || 'ACC1422'}
                </Typography>
                {(data.workOrderInfo?.CERTIFICATION_LEGAL || '').toUpperCase().includes('FSC') && (
                  <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.85rem' }, mt: 0.5, fontWeight: 600 }}>
                    <strong>LEVEL CERTIFICATION: FSC 100%</strong>
                  </Typography>
                )}
              </Box>

              <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
                <Typography sx={{ 
                  fontSize: { xs: '0.8rem', sm: '0.9rem' }, 
                  fontWeight: 700, 
                  mb: 0.5 
                }}>
                  Exporter:
                </Typography>
                <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.85rem' }, mb: 0.3 }}>
                  {data.companyInfo?.Company_Name || 'STAR PLY GABON'}
                </Typography>
                <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.85rem' }, mb: 0.3 }}>
                  {data.companyInfo?.ADDRESS || 'BP 1024, PLOT NO B2/B1, GSEZ, NKOK, LIBREVILLE, GABON'}
                </Typography>
                <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.85rem' } }}>
                  Email: {data.companyInfo?.EMAIL || 'starplygabon@gmail.com'}
                </Typography>
              </Box>

              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, 
                gap: 1, 
                mb: 2 
              }}>
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
            <Box sx={{ 
              mb: 2, 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2 
            }}>
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
            <TableContainer component={Paper} sx={{ 
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)', 
              border: '1px solid #e0e0e0', 
              mb: 2,
              overflowX: 'auto'
            }}>
              <Table sx={{ 
                minWidth: { xs: 800, md: 650 },
                '& .MuiTableCell-root': {
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  padding: { xs: '4px 8px', sm: '8px 16px' }
                }
              }} size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#ffb74d' }}>
                    <TableCell sx={{ 
                      fontWeight: 700, 
                      textAlign: 'center', 
                      py: 1,
                      minWidth: { xs: '80px', sm: '100px' }
                    }}>
                      PALLET NO.
                    </TableCell>
                    <TableCell sx={{ 
                      fontWeight: 700, 
                      textAlign: 'center', 
                      py: 1,
                      minWidth: { xs: '200px', sm: '250px' }
                    }}>
                      Description des biens
                    </TableCell>
                    <TableCell sx={{ 
                      fontWeight: 700, 
                      textAlign: 'center', 
                      py: 1,
                      minWidth: { xs: '120px', sm: '150px' }
                    }}>
                      Quantité
                    </TableCell>
                    <TableCell sx={{ 
                      fontWeight: 700, 
                      textAlign: 'center', 
                      py: 1,
                      minWidth: { xs: '80px', sm: '100px' }
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
                      Metre Cube
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getPackingListData(data.mainRows).map((row, index) => (
                    <TableRow key={index} hover>
                      <TableCell sx={{ textAlign: 'center' }}>
                        {row.LOTNUMBER || index + 1}/{row.TOTAL_PALLETS || data.mainRows.length}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        Contre-plaqué {row.LENGTH} X {row.WIDTH} X {row.THICKNESS} MM
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        {row.PCS} PCS. (1 PACKAGE OF {row.PCS} PCS.)
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        {row.GLUE || ''}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        {row.TYPE || ''}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        {row.individualCBM.toFixed(3)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Summary - 40-60 Layout */}
            <Box sx={{ mt: 2, display: 'flex', gap: 0, flexDirection: { xs: 'column', md: 'row' } }}>
              {/* Left Side - 40% - Summary Text */}
              <Box sx={{ 
                flex: { xs: '1', md: '0 0 40%' },
                pr: { xs: 0, md: 2 }
              }}>
                <Typography sx={{ fontSize: '0.85rem', mb: 1 }}>
                  <strong>Note:</strong> Pour Industrie DuBois
                </Typography>
                <Typography sx={{ fontSize: '0.85rem', mb: 0.5 }}>
                  <strong>TOTAL {data.mainRows.length} PACKAGE</strong>
                </Typography>
                <Typography sx={{ fontSize: '0.85rem', mb: 0.5 }}>
                  <strong>Total Quantité:</strong> {data.mainRows.reduce((sum, row) => sum + (parseInt(row.PCS) || 0), 0)} PCS
                </Typography>
                <Typography sx={{ fontSize: '0.85rem', mb: 0.5 }}>
                  <strong>Total Metre Cube:</strong> {getPackingListData(data.mainRows).reduce((sum, row) => sum + row.individualCBM, 0).toFixed(3)}
                </Typography>
                <Typography sx={{ fontSize: '0.85rem' }}>
                  <strong>Poids Net (Net Weight):</strong> {data.workOrderInfo?.Poids_Net || '22500'} KGS
                </Typography>
              </Box>

              {/* Right Side - 60% - Summary Table */}
              <Box sx={{ 
                flex: { xs: '1', md: '0 0 60%' },
                mt: { xs: 2, md: 0 }
              }}>
                {data.summaryRows && data.summaryRows.length > 0 && (
                  <TableContainer component={Paper} sx={{ 
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)', 
                    border: '1px solid #e0e0e0',
                    overflowX: 'auto',
                    width: '100%'
                  }}>
                    <Table sx={{ 
                      width: '100%',
                      '& .MuiTableCell-root': {
                        fontSize: { xs: '0.7rem', sm: '0.8rem' },
                        padding: { xs: '4px 6px', sm: '6px 8px' }
                      }
                    }} size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#ffb74d' }}>
                          <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>THICKNESS</TableCell>
                          <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>LENGTH</TableCell>
                          <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>WIDTH</TableCell>
                          <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>PCS</TableCell>
                          <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>CBM</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {data.summaryRows.map((row, index) => (
                          <TableRow key={index} hover sx={{ 
                            backgroundColor: row.THICKNESS === 'TOTAL' ? '#fff3e0' : 'inherit'
                          }}>
                            <TableCell sx={{ 
                              textAlign: 'center',
                              fontWeight: row.THICKNESS === 'TOTAL' ? 700 : 400
                            }}>
                              {row.THICKNESS || ''}
                            </TableCell>
                            <TableCell sx={{ 
                              textAlign: 'center',
                              fontWeight: row.THICKNESS === 'TOTAL' ? 700 : 400
                            }}>
                              {row.LENGTH === null || row.LENGTH === 'NULL' ? '-' : row.LENGTH}
                            </TableCell>
                            <TableCell sx={{ 
                              textAlign: 'center',
                              fontWeight: row.THICKNESS === 'TOTAL' ? 700 : 400
                            }}>
                              {row.WIDTH === null || row.WIDTH === 'NULL' ? '-' : row.WIDTH}
                            </TableCell>
                            <TableCell sx={{ 
                              textAlign: 'center',
                              fontWeight: row.THICKNESS === 'TOTAL' ? 700 : 400
                            }}>
                              {row.PCS || ''}
                            </TableCell>
                            <TableCell sx={{ 
                              textAlign: 'center',
                              fontWeight: row.THICKNESS === 'TOTAL' ? 700 : 400
                            }}>
                              {row.CBM || ''}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
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
