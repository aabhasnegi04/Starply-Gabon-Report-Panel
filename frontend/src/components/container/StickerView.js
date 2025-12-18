import React, { useState, useRef } from 'react';
import { TextField, Button, Container, Box, Card, CardContent, CircularProgress, Alert, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import InventoryIcon from '@mui/icons-material/Inventory';
import { useReactToPrint } from 'react-to-print';
import * as XLSX from 'xlsx';
import Sticker from '../common/Sticker';
import { API_URL } from '../../config';

const StickerView = () => {
  const [container, setContainer] = useState('');
  const [stickers, setStickers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const printRef = useRef();

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: ' ',
    pageStyle: `
      @page { 
        size: A4; 
        margin: 10mm; 
      }
      @media print {
        body { -webkit-print-color-adjust: exact; }
        .MuiContainer-root, .MuiGrid-root { padding: 0 !important; margin: 0 !important; }
        .sticker-print-page { page-break-after: always; break-after: page; }
      }
    `
  });

  const handleExcelDownload = () => {
    if (!stickers.length) return;

    // Prepare data for Excel export
    const excelData = stickers.map((sticker, index) => ({
      'Sticker No.': index + 1,
      'Container': container,
      'Pallet No.': sticker.palletNo,
      'Description': sticker.description,
      'Quantity (PCS)': sticker.quantity,
      'CBM': sticker.cbm,
      'Length (mm)': sticker.length,
      'Width (mm)': sticker.width,
      'Thickness (mm)': sticker.thickness,
      'Quality': sticker.quality,
      'Species': sticker.species,
      'Glue': sticker.glue,
      'Class': sticker.class
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Stickers');
    XLSX.writeFile(workbook, `Stickers_${container}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Fetch stickers from backend
  const handleSearch = async () => {
    setLoading(true);
    setError('');
    setStickers([]);
    try {
      const res = await fetch(`${API_URL}/container/viewsticker`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ container })
      });
      if (!res.ok) throw new Error('API error: ' + res.statusText);
      const apiData = await res.json();

      // Map recordsets with correct indices
      const companyInfo = apiData.data?.[0]?.[0] || {};
      const mainHeader = apiData.data?.[1]?.[0] || {};
      const mainStickerRows = apiData.data?.[2] || [];
      const certificatesRow = apiData.data?.[4]?.[0] || {};
      const destination = apiData.data?.[3]?.[0]?.DESTINATION || '';
      const certificates = [
        certificatesRow.CERTIFICATE1,
        certificatesRow.CERTIFICATE2,
        certificatesRow.CERTIFICATE3,
        certificatesRow.CERTIFICATE4,
        certificatesRow.CERTIFICATE5
      ].filter(Boolean);

      const stickerList = mainStickerRows.map(row => {
        // Get CERTIFICATION_LEGAL from mainHeader (recordset 1) - it's the same for all pallets
        const certificationLegal = mainHeader.CERTIFICATION_LEGAL || '';
        const isFSC = certificationLegal.toUpperCase().includes('FSC');
        
        // Add FSC certification to certificates if it's FSC
        const allCertificates = [...certificates];
        if (isFSC) {
          allCertificates.push('LEVEL CERTIFICATION : FSC 100%');
        }

        return {
          company: companyInfo.Company_Name || '',
          consignee: mainHeader.SHIPTO_PARTYNAME || '',
          destination,
          length: row.LENGTH,
          width: row.WIDTH,
          thickness: row.THICKNESS,
          quality: row.QUALITY,
          pcs: row.PCS,
          cbm: parseFloat(row.CBM || 0).toFixed(3),
          species: row.SPECIES,
          glue: row.GLUE,
          productClass: row.CLASS,
          lotNumber: row.LOTNUMBER,
          totalPallets: row.TOTAL_PALLETS,
          orderNo: mainHeader.Work_OrderNo || '',
          certificates: allCertificates
        };
      });
      setStickers(stickerList);
      if (stickerList.length === 0) setError('No records found for this container.');
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
            <SearchIcon sx={{ fontSize: 28, color: '#1b4332', mr: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 600, color: '#1b4332', letterSpacing: '-0.5px' }}>
              Sticker Container Search
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
      {stickers.length > 0 && (
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
                    {stickers.length} Sticker{stickers.length !== 1 ? 's' : ''} Found
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
                    Container: {container}
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
                  Print All
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

      {/* Sticker Preview Grid - 2 columns showing ALL stickers */}
      {stickers.length > 0 && (
        <Box className="print-hide">
          <Typography variant="body2" sx={{ mb: 2, color: '#666', fontWeight: 500 }}>
            Preview of {stickers.length} sticker{stickers.length !== 1 ? 's' : ''}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {stickers.map((sticker, idx) => (
              <Box key={idx} sx={{ 
                width: 'calc(50% - 4px)',
                flexShrink: 0
              }}>
                <Card sx={{ 
                  borderRadius: 1,
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                  overflow: 'hidden',
                  p: 0,
                  m: 0,
                  width: '100%',
                  border: '1px solid #e0e0e0'
                }}>
                  <Box sx={{ 
                    transform: 'scale(0.48)', 
                    transformOrigin: 'top left',
                    width: '208.33%',
                    marginBottom: '-52%'
                  }}>
                    <Sticker {...sticker} />
                  </Box>
                </Card>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Empty State */}
      {stickers.length === 0 && !loading && !error && (
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
            No stickers to display
          </Typography>
          <Typography variant="body2" sx={{ color: '#999', mt: 1 }}>
            Enter a container number above to get started
          </Typography>
        </Card>
      )}

      {/* Hidden Print Area - Visually hidden but available for printing */}
      <div ref={printRef} className="print-only">
        {stickers.map((sticker, idx) => (
          <div key={idx} className="sticker-print-page">
            <Sticker {...sticker} />
          </div>
        ))}
      </div>
    </Container>
  );
};

export default StickerView;

